import {
  ApprovalForAll,
  Approve_ERC20,
  Approve_ERC721,
  Methods,
  RequestType,
  SafeBatchTransferFrom_ERC1155,
  SafeTransferFrom_ERC1155,
  SafeTransferFrom_ERC721,
  SafeTransferFrom_WithData_ERC721,
  Transfer_ERC20,
  Transfer_ERC721,
} from './RequestTypes';
import { BigNumber, constants, providers, utils } from 'ethers';
import EtherscanHub, { DecodedFunc } from '../hubs/EtherscanHub';
import { PreExecResult, preExecTx } from '../../common/apis/Debank';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155Token } from '../../models/ERC1155';
import { ERC20Token } from '../../models/ERC20';
import { ERC721Token } from '../../models/ERC721';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';
import { NFTMetadata } from './NonFungibleTokenTransferring';
import Sourcify from '../hubs/Sourcify';
import { WCCallRequest_eth_sendTransaction } from '../../models/entities/WCSession_v1';
import numeral from 'numeral';
import { showMessage } from 'react-native-flash-message';
import { sleep } from '../../utils/async';

export interface SpeedupAbleSendParams extends WCCallRequest_eth_sendTransaction {
  speedUp?: boolean;
}

interface IConstructor {
  network: INetwork;
  account: Account;
  param: SpeedupAbleSendParams;
}

export function parseRequestType(data = ''): { type: RequestType; methodFunc: string } {
  if (typeof data !== 'string') return { type: 'Unknown', methodFunc: '' };
  const methodFunc = (data || '').slice(0, 10);
  return { type: data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer', methodFunc };
}

const PreExecChains = new Set([1, 10, 42161]);

export class RawTransactionRequest extends BaseTransaction {
  private param: WCCallRequest_eth_sendTransaction;

  erc721?: ERC721Token;
  erc1155?: ERC1155Token;
  erc20?: ERC20Token;
  nfts: NFTMetadata[] = [];

  type: RequestType = 'Unknown';
  valueWei = BigNumber.from(0);
  tokenAmountWei = BigNumber.from(0);
  tokenDecimals = 18;
  tokenSymbol = '';
  tokenAddress = '';
  decodedFunc: DecodedFunc | null = null;
  decodingFunc = false;
  preExecResult: PreExecResult | null = null;
  preExecuting = true;

  get tokenAmount() {
    try {
      const bigValue = utils.formatUnits(this.tokenAmountWei, this.tokenDecimals);
      const value = Number(bigValue) || 0;

      return value < 1
        ? value === 0
          ? '0'
          : bigValue
        : `${value}`.includes('e+')
        ? bigValue
        : numeral(bigValue).format(Number.isInteger(value) ? '0,0' : '0,0.00');
    } catch (error) {
      return '0';
    }
  }

  get maxUint256Amount() {
    return this.tokenAmountWei.eq(constants.MaxUint256);
  }

  get value() {
    try {
      if (this.valueWei.add(this.txFeeWei).gt(this.nativeToken.balance)) {
        return Math.max(0, Number(utils.formatEther(this.nativeToken.balance.sub(this.txFeeWei)))).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        });
      }

      return Number(utils.formatEther(this.valueWei)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      return '0';
    }
  }

  get exceedERC20Balance() {
    return this.erc20 ? this.tokenAmountWei.gt(this.erc20.balance) : false;
  }

  get nft() {
    return this.erc1155 || this.erc721;
  }

  constructor({ param, network, account }: IConstructor) {
    super({ network, account }, !param.speedUp);

    this.param = param;

    makeObservable(this, {
      type: observable,
      valueWei: observable,
      value: computed,
      tokenAmountWei: observable,
      tokenAmount: computed,
      tokenDecimals: observable,
      tokenSymbol: observable,
      tokenAddress: observable,
      decodedFunc: observable,
      preExecResult: observable,
      preExecuting: observable,
      isValidParams: computed,
      setERC20ApproveAmount: action,
      exceedERC20Balance: computed,
      parseRequest: action,

      nft: computed,
      nfts: observable,
    });

    this.parseRequest(param);
  }

  async parseRequest(param: SpeedupAbleSendParams) {
    const { methodFunc, type } = parseRequestType(param.data);
    const chainId = this.network.chainId;
    const owner = this.account.address;

    this.type = type;
    let erc20: ERC20Token | undefined;
    let erc721: ERC721Token | undefined;
    let erc1155: ERC1155Token | undefined;
    let isRawTx = false;

    switch (methodFunc) {
      case Transfer_ERC20:
        erc20 = new ERC20Token({ chainId, contract: param.to, owner });
        const [to, transferAmount] = erc20.interface.decodeFunctionData('transfer', param.data) as [string, BigNumber];

        this.setTo(to);
        this.tokenAmountWei = transferAmount;

        this.tokenAddress = utils.getAddress(param.to);
        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        erc20.getBalance();
        this.erc20 = erc20;
        break;

      case Transfer_ERC721:
      case SafeTransferFrom_ERC721:
      case SafeTransferFrom_WithData_ERC721:
        const erc721_methods = new Map([
          [Transfer_ERC721, 'transferFrom(address,address,uint256)'],
          [SafeTransferFrom_ERC721, 'safeTransferFrom(address,address,uint256)'],
          [SafeTransferFrom_WithData_ERC721, 'safeTransferFrom(address,address,uint256,bytes)'],
        ]);

        erc721 = new ERC721Token({ tokenId: '0', contract: param.to, chainId, owner });

        const [_, to721, tokenID721] = erc721.interface.decodeFunctionData(erc721_methods.get(methodFunc)!, param.data) as [
          string,
          string,
          BigNumber
        ];

        erc721 = new ERC721Token({ tokenId: tokenID721!.toString(), chainId, owner, contract: param.to, fetchMetadata: true });

        this.setTo(to721!);
        runInAction(() => {
          this.erc721 = erc721;
          this.tokenDecimals = 0;
          this.tokenAmountWei = BigNumber.from('1');
        });

        break;

      case SafeTransferFrom_ERC1155:
        erc1155 = new ERC1155Token({ contract: param.to, chainId, owner, tokenId: '0' });
        const [__, to1155, id1155, amount1155] = erc1155.interface.decodeFunctionData(
          'safeTransferFrom(address,address,uint256,uint256,bytes)',
          param.data
        ) as [string, string, BigNumber, BigNumber];

        erc1155 = new ERC1155Token({ contract: param.to, chainId, owner, tokenId: id1155.toString(), fetchMetadata: true });

        this.setTo(to1155);
        runInAction(() => {
          this.erc1155 = erc1155;
          this.tokenDecimals = 0;
          this.tokenAmountWei = amount1155;
        });

        break;
      case SafeBatchTransferFrom_ERC1155:
        erc1155 = new ERC1155Token({ contract: param.to, chainId, owner, tokenId: '0' });
        const [___, batchTo1155, ids1155, amounts1155] = erc1155.interface.decodeFunctionData(
          'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
          param.data
        ) as [string, string, BigNumber[], BigNumber[]];

        erc1155 = new ERC1155Token({
          contract: param.to,
          chainId,
          owner,
          tokenId: ids1155[0].toString(),
          fetchMetadata: true,
        });

        this.setTo(batchTo1155);
        runInAction(() => {
          this.erc1155 = erc1155;
          this.tokenDecimals = 0;
          this.tokenAmountWei = amounts1155.reduce((p, c) => p.add(c));
        });

        break;

      case Approve_ERC20:
      case Approve_ERC721:
        erc20 = new ERC20Token({ chainId, contract: param.to, owner });

        if (param.data.length < 136) break;

        const [spender, approveAmountOrTokenId] = erc20.interface.decodeFunctionData('approve', param.data) as [
          string,
          BigNumber
        ];

        erc721 = new ERC721Token({
          chainId: this.network.chainId,
          contract: param.to,
          owner: this.account.address,
          tokenId: approveAmountOrTokenId.toString(),
        });

        this.setTo(spender);

        const ownerOf = (await erc721.ownerOf(approveAmountOrTokenId.toString(), true)) || '';
        const isERC721 = utils.isAddress(ownerOf) && ownerOf === owner;

        if (isERC721) {
          runInAction(() => {
            this.erc721 = erc721;
            this.type = 'Approve_ERC721';
            this.tokenDecimals = 0;
          });
        } else {
          const [erc20Decimals, erc20Symbol] = await Promise.all([erc20.getDecimals(), erc20.getSymbol(), erc20.getBalance()]);

          runInAction(() => {
            this.erc20 = erc20;
            this.tokenDecimals = erc20Decimals;
            this.tokenSymbol = erc20Symbol;
            this.tokenAmountWei = approveAmountOrTokenId;
            this.tokenAddress = utils.getAddress(param.to);
          });
        }

        break;

      case ApprovalForAll:
        erc721 = new ERC721Token({ chainId, contract: param.to, owner, tokenId: '1' });

        const [operator, approved] = erc721.interface.decodeFunctionData('setApprovalForAll', param.data) as [string, boolean];
        this.type = approved ? 'Approve_ForAll' : 'Revoke_ForAll';
        this.setTo(operator);
        this.account.nfts
          .fetch(this.network.chainId)
          .then((v) =>
            runInAction(() => (this.nfts = v.filter((i) => i.contract.toLowerCase() === param.to.toLowerCase())).slice(0, 12))
          );

        break;

      default:
        this.setTo(param.to);
        this.valueWei = BigNumber.from(param.value || 0);

        if ((param.data?.length ?? 2) < 10) break;
        if (!utils.isAddress(this.toAddress)) break;

        isRawTx = true;

        this.decodingFunc = true;

        const decodedFunc = await Promise.race([
          Sourcify.decodeCall(this.network, this.toAddress, param.data),
          EtherscanHub.decodeCall(this.network, this.toAddress, param.data),
        ]);

        runInAction(() => {
          this.decodedFunc = decodedFunc;
          this.decodingFunc = false;
        });
    }

    if (param.gas || param.gasLimit) {
      runInAction(() => this.setGasLimit(param.gas || param.gasLimit || 0));
    } else {
      this.estimateGas({
        from: this.account.address,
        to: param.to,
        data: param.data,
        value: !Number(param.value) ? '0x0' : BigNumber.from(param.value).toHexString(),
      });
    }

    if (param.gasPrice && param.speedUp) {
      runInAction(() => this.setMaxGasPrice(Number(param.gasPrice) / Gwei_1));
    }

    if (param.priorityPrice && param.speedUp) {
      runInAction(() => this.setPriorityPrice(Number(param.priorityPrice) / Gwei_1));
    }

    if (param.nonce) runInAction(() => this.setNonce(param.nonce));

    if (!isRawTx || !PreExecChains.has(this.network.chainId) || __DEV__) {
      runInAction(() => (this.preExecuting = false));
      return;
    }

    while (this.initializing) {
      await sleep(500);
    }

    runInAction(() => (this.preExecuting = true));

    const preExecResult = await preExecTx({
      chainId: this.network.chainId,
      from: param.from,
      to: param.to,
      value: param.value,
      data: param.data,
      nonce: utils.hexValue(this.nonce),
      gas: utils.hexValue(this.gasLimit),
    });

    runInAction(() => {
      this.preExecResult = preExecResult;
      this.preExecuting = false;
    });
  }

  setERC20ApproveAmount(amount: string) {
    if (!this.erc20 || this.erc20.decimals < 0) return;
    if (amount.endsWith('.')) return;
    amount = amount.replace(/,/g, '');

    try {
      const data = this.erc20.interface.encodeFunctionData('approve', [
        this.to,
        utils.parseUnits(amount, this.erc20.decimals),
      ]);

      this.param.data = data;
      this.txException = '';
      this.tokenAmountWei = utils.parseUnits(amount, this.erc20.decimals);
    } catch (error: any) {
      this.txException = 'Invalid amount';
    }
  }

  get insufficientFee() {
    return this.valueWei.add(this.txFeeWei).gt(this.nativeToken.balance);
  }

  get isValidParams() {
    return (
      !this.loading &&
      (utils.isAddress(this.param.to) || this.param.to === '' || this.param.to === undefined) && // Empty address is allowed - it means contract deploying
      this.nonce >= 0 &&
      this.isValidGas &&
      !this.txException &&
      !this.insufficientFee
    );
  }

  get txRequest(): providers.TransactionRequest | undefined {
    try {
      let valueEther = BigNumber.from(this.param.value || 0);

      if (valueEther.gt(0) && valueEther.eq(this.nativeToken.balance)) {
        valueEther = BigNumber.from(this.nativeToken.balance!).sub(this.txFeeWei);
        valueEther = valueEther.lt(0) ? BigNumber.from(0) : valueEther;
      }

      const tx: providers.TransactionRequest = {
        chainId: this.network.chainId,
        from: this.param.from || this.account.address,
        to: this.param.to,
        data: this.param.data || '0x',
        value: valueEther,

        nonce: this.nonce,
        gasLimit: this.gasLimit,
        type: this.network.eip1559 ? 2 : 0,
      };

      if (tx.type === 0) {
        tx.gasPrice = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
      } else {
        tx.maxFeePerGas = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
        tx.maxPriorityFeePerGas = Number.parseInt((this.maxPriorityPrice * Gwei_1) as any);
      }

      return tx;
    } catch (error) {
      showMessage((error as any)?.message);
    }
  }
}

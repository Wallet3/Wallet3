import { Approve_ERC1155, Approve_ERC20, Approve_ERC721, Methods, RequestType, Transfer_ERC20 } from './RequestTypes';
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
import { WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';
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
  erc20?: ERC20Token;

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
      const value = Number(utils.formatUnits(this.tokenAmountWei, this.tokenDecimals)) || 0;

      return value < 1
        ? utils.formatUnits(this.tokenAmountWei, this.tokenDecimals)
        : numeral(value).format(Number.isInteger(value) ? '0,0' : '0,0.00');
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
    });

    this.parseRequest(param);
  }

  async parseRequest(param: SpeedupAbleSendParams) {
    const { methodFunc, type } = parseRequestType(param.data);

    this.type = type;
    let erc20: ERC20Token | undefined;
    let erc721: ERC721Token | undefined;
    let isRawTx = false;

    switch (methodFunc) {
      case Transfer_ERC20:
        erc20 = new ERC20Token({ chainId: this.network.chainId, contract: param.to, owner: this.account.address });
        const [to, transferAmount] = erc20.interface.decodeFunctionData('transfer', param.data) as [string, BigNumber];

        this.setTo(to);
        this.tokenAmountWei = transferAmount;

        this.tokenAddress = utils.getAddress(param.to);
        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        erc20.getBalance();
        this.erc20 = erc20;
        break;

      case Approve_ERC20:
      case Approve_ERC721:
        erc20 = new ERC20Token({ chainId: this.network.chainId, contract: param.to, owner: this.account.address });

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

        const owner = (await erc721.ownerOf(approveAmountOrTokenId.toString())) || '';
        const isERC721 = utils.isAddress(owner) && owner === this.account.address;

        runInAction(() => {
          if (isERC721) {
            this.erc721 = erc721;
            this.type = 'Approve_ERC721';

            erc721?.fetchMetadata();
          } else {
            this.erc20 = erc20;
            this.tokenAmountWei = approveAmountOrTokenId;
            this.tokenAddress = utils.getAddress(param.to);
          }
        });

        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        erc20.getBalance();

        break;

      case Approve_ERC1155:
        const erc1155 = new ERC1155Token({
          chainId: this.network.chainId,
          contract: param.to,
          owner: this.account.address,
          tokenId: '1',
        });

        try {
          const [operator] = erc1155.interface.decodeFunctionData('setApprovalForAll', param.data) as [string, boolean];
          this.setTo(operator);
        } catch (error) {}

        break;

      default:
        this.setTo(param.to);
        this.valueWei = BigNumber.from(param.value || 0);

        if (param.data?.length < 10) break;

        isRawTx = true;

        this.decodingFunc = true;
        const decodedFunc = await EtherscanHub.decodeCall(this.network, param.to, param.data);

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

    if (!isRawTx || !PreExecChains.has(this.network.chainId)) {
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

  get isValidParams() {
    return (
      !this.initializing &&
      !this.preExecuting &&
      (utils.isAddress(this.param.to) || this.param.to === '') && // Empty address is allowed - it means contract deploying
      this.nonce >= 0 &&
      this.isValidGas &&
      this.nativeToken.balance.gte(this.valueWei) &&
      !this.isEstimatingGas &&
      !this.txException &&
      !this.insufficientFee &&
      !this.nativeToken.loading
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
import { BigNumber, constants, ethers, providers, utils } from 'ethers';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction, WCClientMeta } from '../../models/WCSession_v1';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { ERC20Token } from '../../models/ERC20';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';
import Networks from '../Networks';
import { WalletConnect_v1 } from '../walletconnect/WalletConnect_v1';

export interface SpeedupAbleParams extends WCCallRequest_eth_sendTransaction {
  minGasPrice?: number;
}

interface IConstructor {
  network: INetwork;
  account: Account;
  param: SpeedupAbleParams;
}

type RequestType = 'Transfer' | 'Contract Interaction' | 'Approve' | 'Unknown';

const Transfer = '0xa9059cbb';
const Approve = '0x095ea7b3';
const Methods = new Map<string, RequestType>([
  [Transfer, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve, 'Approve'],
]);

export function parseRequestType(data = ''): { type: RequestType; methodFunc: string } {
  if (typeof data !== 'string') return { type: 'Unknown', methodFunc: '' };
  const methodFunc = (data || '').slice(0, 10);
  return { type: data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer', methodFunc };
}

export class RawTransactionRequest extends BaseTransaction {
  private param: WCCallRequest_eth_sendTransaction;
  private erc20?: ERC20Token;

  type!: RequestType;
  to!: string;
  valueWei = BigNumber.from(0);
  tokenAmountWei = BigNumber.from(0);
  tokenDecimals = 18;
  tokenSymbol = '';

  get tokenAmount() {
    try {
      return Number(utils.formatUnits(this.tokenAmountWei, this.tokenDecimals)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      return '0';
    }
  }

  get maxUint256Amount() {
    return this.tokenAmountWei.eq(constants.MaxUint256);
  }

  get value() {
    try {
      return Number(utils.formatUnits(this.valueWei, 18)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      return '0';
    }
  }

  get token() {
    return this.erc20;
  }

  constructor({ param, network, account }: IConstructor) {
    super({ network, account });

    this.param = param;

    makeObservable(this, {
      valueWei: observable,
      value: computed,
      tokenAmountWei: observable,
      tokenAmount: computed,
      tokenDecimals: observable,
      tokenSymbol: observable,
      isValidParams: computed,
      setApproveAmount: action,
      insufficientFee: computed,
    });

    runInAction(() => this.parseRequest(param));
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }

  async parseRequest(param: WCCallRequest_eth_sendTransaction) {
    const { methodFunc, type } = parseRequestType(param.data);

    this.type = type;
    const erc20 = new ERC20Token({ chainId: this.network.chainId, contract: param.to, owner: this.account.address });
    this.erc20 = erc20;

    switch (methodFunc) {
      case Transfer:
        const [to, transferAmount] = erc20.interface.decodeFunctionData('transfer', param.data) as [string, BigNumber];

        this.to = to;
        this.tokenAmountWei = transferAmount;

        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        break;
      case Approve:
        const [spender, approveAmount] = erc20.interface.decodeFunctionData('approve', param.data) as [string, BigNumber];

        this.to = spender;
        this.tokenAmountWei = approveAmount;

        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        break;

      default:
        this.to = param.to;
        this.valueWei = BigNumber.from(param.value || 0);
        break;
    }

    if (param.gas || param.gasLimit) {
      runInAction(() => this.setGasLimit(param.gas || param.gasLimit || 0));
    } else {
      this.estimateGas({ from: this.account.address, to: param.to, data: param.data, value: param.value });
    }

    if (param.nonce) runInAction(() => this.setNonce(param.nonce));
  }

  setApproveAmount(amount: string) {
    if (!this.erc20 || this.erc20.decimals < 0) return;

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
      utils.isAddress(this.param.to) &&
      this.nonce >= 0 &&
      this.maxGasPrice > 0 &&
      this.gasLimit >= 21000 &&
      this.nativeToken.balance.gte(this.valueWei) &&
      !this.isEstimatingGas &&
      !this.txException &&
      !this.insufficientFee &&
      !this.nativeToken.loading
    );
  }

  get insufficientFee() {
    return this.txFeeWei.gt(this.nativeToken.balance);
  }

  get txRequest(): providers.TransactionRequest {
    const tx: providers.TransactionRequest = {
      chainId: this.network.chainId,
      from: this.param.from || this.account.address,
      to: this.param.to,
      data: this.param.data || '0x',
      value: this.param.value || '0x0',

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
  }
}

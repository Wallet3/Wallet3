import { BigNumber, providers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseTransaction } from './BaseTransaction';
import { ERC20Token } from '../../models/ERC20';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import { NativeToken } from '../../models/NativeToken';

export class TokenTransferring extends BaseTransaction {
  token: IToken;
  amount = '0';
  userTxData = '0x';

  get allTokens() {
    return [this.account.tokens.tokens[0], ...this.account.tokens.allTokens];
  }

  get amountWei() {
    try {
      if (this.isNativeToken) {
        const ether = utils.parseEther(this.amount);
        if (ether.eq(this.account.nativeToken.balance!)) {
          return BigNumber.from(this.account.nativeToken.balance!).sub(this.txFeeWei);
        }
      }

      return utils.parseUnits(this.amount, this.token.decimals || 18);
    } catch (error) {
      return BigNumber.from(-1);
    }
  }

  get isValidAmount() {
    try {
      return this.amountWei.gt(0) && this.amountWei.lte(this.token.balance!) && !this.token.loading;
    } catch (error) {
      return false;
    }
  }

  get isNativeToken() {
    return !this.token.address;
  }

  get insufficientFee() {
    return this.isNativeToken
      ? this.amountWei.add(this.txFeeWei).gt(this.account.nativeToken.balance!)
      : this.txFeeWei.gt(this.account.nativeToken.balance!);
  }

  get isValidParams() {
    return (
      !this.initializing &&
      this.toAddress &&
      this.isValidAmount &&
      this.nonce >= 0 &&
      this.isValidGas &&
      this.network &&
      !this.insufficientFee &&
      !this.token.loading &&
      !this.isEstimatingGas &&
      !this.txException
    );
  }

  get encodedUserTxData() {
    return utils.isBytesLike(this.userTxData)
      ? this.userTxData.startsWith('0x')
        ? this.userTxData
        : `0x${this.userTxData}`
      : `0x${Buffer.from(this.userTxData, 'utf8').toString('utf-8')}`;
  }

  get txRequest(): providers.TransactionRequest {
    const data = this.isNativeToken
      ? this.encodedUserTxData
      : (this.token as ERC20Token).encodeTransferData(this.toAddress, this.amountWei);

    const tx: providers.TransactionRequest = {
      chainId: this.network.chainId,
      from: this.account.address,
      to: this.isNativeToken ? this.toAddress : this.token.address,
      value: this.isNativeToken ? this.amountWei : 0,
      nonce: this.nonce,
      data,
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

  constructor({
    targetNetwork,
    defaultToken,
    autoSetToken,
    to,
  }: {
    targetNetwork: INetwork;
    defaultToken?: IToken;
    autoSetToken?: boolean;
    to?: string;
  }) {
    const account = App.currentAccount!;

    super({ account, network: targetNetwork });

    this.token = defaultToken || this.account.tokens.tokens[0];

    makeObservable(this, {
      token: observable,
      amount: observable,
      userTxData: observable,
      isValidParams: computed,
      amountWei: computed,
      isValidAmount: computed,
      allTokens: computed,

      setAmount: action,
      setToken: action,
      setUserTxData: action,
    });

    if (autoSetToken || (autoSetToken === undefined && !defaultToken)) this.loadDefaultToken();

    if (to) this.setTo(to);
  }

  protected loadDefaultToken() {
    AsyncStorage.getItem(`${this.network.chainId}-${this.account.address}-LastUsedToken`).then((v) => {
      if (!v) {
        runInAction(() => this.setToken(this.account.tokens.tokens[0]));
        return;
      }

      const token = this.account.tokens.allTokens.find((t) => t.address === v) || this.account.tokens.tokens[0];
      runInAction(() => this.setToken(token));
    });
  }

  async estimateGas() {
    if (!this.toAddress) return;

    runInAction(() => (this.isEstimatingGas = true));
    const { gas, errorMessage } = this.isNativeToken
      ? await (this.token as NativeToken).estimateGas(this.toAddress, this.encodedUserTxData)
      : await (this.token as ERC20Token).estimateGas(this.toAddress, this.amountWei);

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  setToken(token: IToken) {
    if (this.token.address === token.address) return;

    this.token = token;
    this.txException = '';

    (token as ERC20Token)?.getBalance?.(false);
    AsyncStorage.setItem(`${this.network.chainId}-${this.account.address}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
    this.txException = '';
  }

  sendTx(pin?: string) {
    return super.sendRawTx(
      {
        tx: this.txRequest,
        readableInfo: {
          type: 'transfer',
          symbol: this.token.symbol,
          decimals: this.token.decimals,
          amountWei: this.amountWei.toString(),
          amount: Number(this.amount).toLocaleString(undefined, { maximumFractionDigits: 7 }),
          recipient: this.to || this.toAddress,
        },
      },
      pin
    );
  }

  setUserTxData(data: string) {
    this.userTxData = data;
  }
}

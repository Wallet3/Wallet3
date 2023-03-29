import { BigNumber, providers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import App from '../core/App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseTransaction } from './BaseTransaction';
import { ERC20Token } from '../../models/ERC20';
import { Gwei_1 } from '../../common/Constants';
import { IFungibleToken } from '../../models/Interfaces';
import { INetwork } from '../../common/Networks';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';

export class TokenTransferring extends BaseTransaction {
  token: IFungibleToken;
  amount = '0';
  userTxData = '0x';

  get transferToRisky() {
    return this.toAddressTag?.dangerous || this.hasZWSP || (this.isContractRecipient && !this.isContractWallet);
  }

  get allTokens() {
    return [this.account.tokens.tokens[0], ...this.account.tokens.allTokens];
  }

  get amountWei() {
    try {
      if (this.token.address === (this.paymaster?.feeToken?.address ?? '')) {
        if (this.isNativeToken && utils.parseEther(this.amount).eq(this.account.nativeToken.balance)) {
          return BigNumber.from(this.account.nativeToken.balance!).sub(this.nativeFeeWei);
        }

        if (utils.parseUnits(this.amount, this.token.decimals).eq(this.token.balance ?? '0')) {
          return BigNumber.from(this.token.balance).sub(this.paymaster?.feeTokenWei ?? 0);
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
    return this.token.isNative ?? false;
  }

  get insufficientFee() {
    if (this.token.isNative) {
      return this.nativeFeeWei.add(this.amountWei).gt(this.token.balance!);
    }

    if (this.token.address === this.paymaster?.feeToken?.address) {
      return this.paymaster.insufficientFee;
    }

    return this.nativeFeeWei.gt(this.account.nativeToken.balance);
  }

  get isValidParams() {
    return (
      !this.loading &&
      this.toAddress &&
      this.isValidAmount &&
      this.nonce >= 0 &&
      this.isValidGas &&
      this.network &&
      !this.insufficientFee &&
      !this.token.loading &&
      !this.txException &&
      this.isValidAccountAndNetwork
    );
  }

  get encodedUserTxData() {
    return utils.isBytesLike(this.userTxData)
      ? this.userTxData.startsWith('0x')
        ? this.userTxData
        : `0x${this.userTxData}`
      : `0x${Buffer.from(this.userTxData, 'utf8').toString('hex')}`;
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
      tx.gasPrice = Number.parseInt(`${this.maxGasPrice * Gwei_1}`);
    } else {
      tx.maxFeePerGas = Number.parseInt(`${this.maxGasPrice * Gwei_1}`);
      tx.maxPriorityFeePerGas = Number.parseInt(`${this.maxPriorityPrice * Gwei_1}`);
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
    defaultToken?: IFungibleToken;
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
      transferToRisky: computed,

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

    const data = this.isNativeToken
      ? this.encodedUserTxData
      : (this.token as ERC20Token).encodeTransferData(this.toAddress, this.amountWei);

    return super.estimateGas({ to: this.isNativeToken ? this.toAddress : this.token.address, data: data });
  }

  setToken(token: IFungibleToken) {
    if (this.token.address === token.address) return;

    this.token = token;
    this.txException = '';

    (token as ERC20Token)?.getBalance?.(false);
    AsyncStorage.setItem(`${this.network.chainId}-${this.account.address}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
    this.txException = '';

    try {
      this.valueWei = this.isNativeToken ? utils.parseEther(this.amount) : BigNumber.from(0);
    } catch (error) {
      this.valueWei = BigNumber.from(0);
    }
  }

  sendTx(pin?: string, onNetworkRequest?: () => void) {
    return super.sendRawTx(
      {
        tx: this.txRequest,
        onNetworkRequest,
        readableInfo: {
          type: 'transfer',
          readableTxt: i18n.t('readable-transfer-token', {
            amount: Number(this.amount).toFixed(4),
            symbol: this.token.symbol,
            dest: utils.isAddress(this.to) ? formatAddress(this.to, 6, 4, '...') : this.to,
          }),
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

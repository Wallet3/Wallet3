import { BigNumber, providers, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../common/Constants';
import { action, computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getGasPrice, getMaxPriorityFee, getNextBlockBaseFee, getTransactionCount } from '../common/RPC';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../models/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';

export class Transferring {
  private timer?: NodeJS.Timer;

  to = '';
  toAddress = '';
  token: IToken;
  amount = '0';
  isResolvingAddress = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = -1;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  get currentNetwork() {
    return Networks.current;
  }

  get isEns() {
    return !utils.isAddress(this.to);
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get amountWei() {
    if (this.isNativeToken) {
      const ether = utils.parseEther(this.amount);
      if (ether.gte(this.currentAccount.nativeToken.balance!)) {
        return BigNumber.from(this.currentAccount.nativeToken.balance!).sub(this.txFeeWei);
      }
    }

    return utils.parseUnits(this.amount, this.token?.decimals || 18);
  }

  get isValidAmount() {
    try {
      return this.amountWei.gte(0) && this.amountWei.lte(this.token?.balance || '0');
    } catch (error) {
      return false;
    }
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get txFeeWei() {
    return this.currentNetwork.eip1559
      ? BigNumber.from(Math.min(Number(this.maxGasPrice.toFixed(9)) * Gwei_1))
          .add(BigNumber.from(Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1))
          .mul(this.gasLimit)
      : BigNumber.from(Number.parseInt((this.maxGasPrice * Gwei_1) as any)).mul(this.gasLimit);
  }

  get txFee() {
    return Number(utils.formatEther(this.txFeeWei)).toFixed(5);
  }

  get isNativeToken() {
    return !this.token.address;
  }

  get inSufficientFee() {
    return this.isNativeToken
      ? this.amountWei.add(this.txFeeWei).gt(this.currentAccount.nativeToken.balance!)
      : this.txFeeWei.gt(this.currentAccount.nativeToken.balance!);
  }

  get isValidParams() {
    return (
      this.toAddress &&
      this.isValidAmount &&
      this.nonce >= 0 &&
      this.maxGasPrice > 0 &&
      this.gasLimit >= 21000 &&
      !this.inSufficientFee
    );
  }

  get txRequest(): providers.TransactionRequest {
    const data = this.isNativeToken ? '0x' : (this.token as ERC20Token).encodeTransferData(this.toAddress, this.amountWei);

    const tx: providers.TransactionRequest = {
      chainId: this.currentNetwork.chainId,
      from: this.currentAccount.address,
      to: this.isNativeToken ? this.toAddress : this.token.address,
      value: this.isNativeToken ? this.amountWei : '0',
      nonce: this.nonce,
      data,
      gasLimit: this.gasLimit,
      type: this.currentNetwork.eip1559 ? 2 : 0,
    };

    if (tx.type === 0) {
      tx.gasPrice = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
    } else {
      tx.maxFeePerGas = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
      tx.maxPriorityFeePerGas = Number.parseInt((this.maxPriorityPrice * Gwei_1) as any);
    }

    return tx;
  }

  constructor() {
    this.token = this.currentAccount.tokens[0];

    makeAutoObservable(this, {
      txFeeWei: computed,
      txFee: computed,
      nextBlockBaseFee: computed,
    });

    AsyncStorage.getItem(`contacts`).then((v) => {
      JSON.parse(v || '[]');
    });

    AsyncStorage.getItem(`${this.currentNetwork.chainId}-LastUsedToken`).then((v) => {
      if (!v) {
        runInAction(() => this.setToken(this.currentAccount.tokens[0]));
        return;
      }

      const token = this.currentAccount.allTokens.find((t) => t.address === v) || this.currentAccount.tokens[0];
      runInAction(() => this.setToken(token));
    });

    this.initChainData();

    if (this.currentNetwork.eip1559) {
      this.timer = setTimeout(() => this.refreshEIP1559(), 1000 * 10);
    }
  }

  private async initChainData() {
    const { chainId } = this.currentNetwork;
    const [gasPrice, nextBaseFee, priorityFee, nonce] = await Promise.all([
      getGasPrice(chainId),
      getNextBlockBaseFee(chainId),
      getMaxPriorityFee(chainId),
      getTransactionCount(chainId, this.currentAccount.address),
    ]);

    runInAction(() => {
      this.nextBlockBaseFeeWei = nextBaseFee;

      this.setNonce(nonce);
      this.setPriorityPrice((priorityFee || Gwei_1) / Gwei_1 + 2);

      if (this.currentNetwork.eip1559) {
        this.setMaxGasPrice((nextBaseFee || Gwei_1) / Gwei_1 + 30);
      } else {
        this.setMaxGasPrice((gasPrice || Gwei_1) / Gwei_1);
      }
    });
  }

  private refreshEIP1559() {
    getNextBlockBaseFee(this.currentNetwork.chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(), 1000 * 10);
    });
  }

  estimateGas() {
    if (!this.toAddress) return;

    if (this.token instanceof ERC20Token) {
      (this.token as ERC20Token)
        .estimateGas(this.toAddress, this.amountWei)
        .then((gas) => runInAction(() => this.setGasLimit(gas)));
    } else {
      estimateGas(this.currentNetwork.chainId, {
        from: this.currentAccount.address,
        to: this.toAddress,
        value: this.amountWei.toString(),
        data: '0x',
      }).then((gas) => runInAction(() => this.setGasLimit(gas || 21000)));
    }
  }

  setTo(to: string) {
    if (this.to === to) return;

    this.to = to;
    this.toAddress = '';
    this.isResolvingAddress = true;

    Networks.MainnetProvider.resolveName(to).then((address) =>
      runInAction(() => {
        this.toAddress = address || to;
        this.isResolvingAddress = false;
      })
    );
  }

  setToken(token: IToken) {
    this.token = token;

    (token as ERC20Token)?.getBalance?.();
    AsyncStorage.setItem(`${this.currentNetwork.chainId}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
  }

  setNonce(nonce: string | number) {
    this.nonce = Number(nonce);
  }

  setGasLimit(limit: string | number) {
    this.gasLimit = Math.max(Math.min(Number.parseInt(limit as any), 100_000_000), 21000);
  }

  setMaxGasPrice(price: string | number) {
    this.maxGasPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
  }

  setPriorityPrice(price: string | number) {
    this.maxPriorityPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
  }

  dispose() {
    clearTimeout(this.timer as any);
  }
}

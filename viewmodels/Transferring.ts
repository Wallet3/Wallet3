import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../models/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { utils } from 'ethers';

export class Transferring {
  to = '';
  toAddress = '';
  token: IToken | undefined = undefined;
  amount = '0';
  isResolvingAddress = false;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  constructor() {
    makeObservable(this, {
      to: observable,
      toAddress: observable,
      token: observable,
      amount: observable,
      isResolvingAddress: observable,
      setTo: action,
      setToken: action,
      setAmount: action,
      isValidAmount: computed,
    });

    AsyncStorage.getItem(`contacts`).then((v) => {
      JSON.parse(v || '[]');
    });

    AsyncStorage.getItem(`${Networks.current.chainId}-LastUsedToken`).then((v) => {
      if (!v) {
        runInAction(() => this.setToken(this.currentAccount.tokens[0]));
        return;
      }

      const token = this.currentAccount.allTokens.find((t) => t.address === v) || this.currentAccount.tokens[0];
      runInAction(() => this.setToken(token));
    });
  }

  setTo(to: string) {
    if (this.to === to) return;

    this.to = to;
    this.toAddress = '';
    this.isResolvingAddress = true;

    Networks.currentProvider.resolveName(to).then((address) => {
      runInAction(() => {
        this.toAddress = address || to;
        this.isResolvingAddress = false;
      });
    });
  }

  setToken(token: IToken) {
    this.token = token;
    (token as ERC20Token).getBalance?.();
    AsyncStorage.setItem(`${Networks.current.chainId}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
  }

  get isEns() {
    return !utils.isAddress(this.to);
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get isValidAmount() {
    try {
      const amount = utils.parseUnits(this.amount, this.token?.decimals || 18);
      return amount.gt(0) && amount.lte(this.token?.balance || '0');
    } catch (error) {
      return false;
    }
  }
}

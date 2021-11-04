import { action, makeObservable, observable, runInAction } from 'mobx';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    return this.currentAccount.allTokens;
  }

  constructor() {
    makeObservable(this, {
      to: observable,
      toAddress: observable,
      token: observable,
      amount: observable,
      isResolvingAddress: observable,

      setTo: action,
    });

    AsyncStorage.getItem(`contacts`).then((v) => {
      JSON.parse(v || '[]');
    });

    AsyncStorage.getItem(`${Networks.current.chainId}-LastUsedToken`).then((v) => {
      if (!v) {
        runInAction(() => (this.token = this.currentAccount.tokens[0]));
        return;
      }

      const token = this.currentAccount.allTokens.find((t) => t.address === v) || this.currentAccount.tokens[0];
      runInAction(() => (this.token = token));
    });
  }

  setTo(to: string) {
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

  get isEns() {
    return !utils.isAddress(this.to);
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }
}

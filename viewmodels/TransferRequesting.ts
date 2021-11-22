import { BigNumber, utils } from 'ethers';
import { action, computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INetwork } from '../common/Networks';
import { IToken } from '../common/Tokens';

export class TransferRequesting {
  token: IToken;
  amount = '';

  readonly network: INetwork;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  get amountWei() {
    try {
      return utils.parseUnits(this.amount, this.token.decimals);
    } catch (error) {
      return BigNumber.from(-1);
    }
  }

  get isValidAmount() {
    return this.amountWei.gte(0);
  }

  constructor(network: INetwork) {
    this.network = network;
    this.token = this.allTokens[0];

    makeObservable(this, {
      token: observable,
      amount: observable,
      allTokens: computed,
      amountWei: computed,
      isValidAmount: computed,
      setToken: action,
      setAmount: action,
    });

    AsyncStorage.getItem(`${network.chainId}-${this.currentAccount.address}-LastUsedToken`).then((v) => {
      if (!v) return;

      const token = this.allTokens.find((t) => t.address === v) || this.allTokens[0];
      runInAction(() => this.setToken(token));
    });
  }

  setToken(token: IToken) {
    this.token = token;

    AsyncStorage.setItem(`${this.network.chainId}-${this.currentAccount.address}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
  }
}

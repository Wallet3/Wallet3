import App from './App';
import { IToken } from '../common/Tokens';
import { makeAutoObservable } from 'mobx';

export class NFCRequesting {
  token: IToken;

  get currentAccount() {
    return App.currentWallet?.currentAccount!;
  }

  get allTokens() {
    return [this.currentAccount.tokens[0], ...this.currentAccount.allTokens];
  }

  constructor() {
    this.token = this.currentAccount.tokens[0];

    makeAutoObservable(this);
  }
}

import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { AccountTokens } from './AccountTokens';
import CurrencyViewmodel from '../settings/Currency';
import { ENSViewer } from './ENSViewer';
import Networks from '../Networks';
import { formatAddress } from '../../utils/formatter';
import { getAvatar } from '../../common/ENS';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: AccountTokens;
  ens: ENSViewer;

  get nativeToken() {
    return this.tokens.nativeToken;
  }

  get displayName() {
    return this.ens.name || formatAddress(this.address, 7, 5);
  }

  get avatar() {
    return this.ens.avatar;
  }

  get balance() {
    return CurrencyViewmodel.usdToToken(this.tokens.balanceUSD);
  }

  constructor(address: string, index: number) {
    // address = '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5';
    this.address = address;
    this.index = index;

    this.tokens = new AccountTokens(this.address);
    this.ens = new ENSViewer(this.address);

    makeObservable(this, {
      tokens: observable,

      displayName: computed,
      balance: computed,
    });
  }

  async fetchBasicInfo() {
    return this.ens.fetchBasicInfo();
  }
}
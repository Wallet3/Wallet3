import * as Debank from '../common/apis/Debank';

import { computed, makeObservable, observable, runInAction } from 'mobx';

import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { formatAddress } from '../utils/formatter';
import { getBalance } from '../common/RPC';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: IToken[] = [];
  balanceUSD = 0;
  ensName = '';
  avatar = '';

  get displayName() {
    return this.ensName || formatAddress(this.address, 7, 5);
  }

  constructor(address: string, index: number) {
    this.address = '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'; // address;
    this.index = index;

    // console.log(address, index);

    makeObservable(this, {
      tokens: observable,
      ensName: observable,
      displayName: computed,
      balanceUSD: observable,
      avatar: observable,
    });
  }

  async refreshOverview() {
    const { usd_value } = await Debank.getBalance(this.address, Networks.current.comm_id);
    runInAction(() => (this.balanceUSD = usd_value));

    const tokens = await Debank.getTokens(this.address, Networks.current.comm_id);
  }

  fetchBasicInfo() {
    if (Networks.current.chainId !== 1) return;
    if (this.ensName) return;

    const { currentProvider } = Networks;
    currentProvider.lookupAddress(this.address).then((v) => runInAction(() => (this.ensName = v || this.address)));
    currentProvider.getAvatar(this.ensName || this.address).then((v) => runInAction(() => (this.avatar = v || '')));
  }
}

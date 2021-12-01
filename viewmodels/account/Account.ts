import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { AccountTokens } from './AccountTokens';
import CurrencyViewmodel from '../settings/Currency';
import Networks from '../Networks';
import { formatAddress } from '../../utils/formatter';
import { getAvatar } from '../../common/ENS';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: AccountTokens;
  ensName = '';
  avatar = '';

  get nativeToken() {
    return this.tokens.nativeToken;
  }

  get displayName() {
    return this.ensName || formatAddress(this.address, 7, 5);
  }

  get balance() {
    return CurrencyViewmodel.usdToToken(this.tokens.balanceUSD);
  }

  constructor(address: string, index: number) {
    this.address = address;
    this.index = index;

    this.tokens = new AccountTokens(address);

    makeObservable(this, {
      tokens: observable,
      ensName: observable,
      displayName: computed,
      balance: computed,
      avatar: observable,
    });
  }

  async fetchBasicInfo() {
    if (this.ensName) return;
    const { MainnetWsProvider } = Networks;

    const ens = await MainnetWsProvider.lookupAddress(this.address);
    if (!ens) return;

    runInAction(() => (this.ensName = ens));
    getAvatar(ens, this.address).then((v) => {
      runInAction(() => (this.avatar = v?.url || ''));
    });
  }
}

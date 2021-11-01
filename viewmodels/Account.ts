import * as Debank from '../common/apis/Debank';

import { computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../common/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { PublicNetworks } from '../common/Networks';
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
    this.address = '0x8568E1A8082B442aE9BE089A3b3888a25Ae55f8C'; // address;
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

    const [native, tokens] = await Promise.all([
      this.refreshNativeToken(),
      (
        await Debank.getTokens(this.address, Networks.current.comm_id)
      ).map((t) => new ERC20Token({ ...t, contract: t.address, provider: Networks.currentProvider })),
    ]);

    runInAction(() => (this.tokens = [native, ...tokens]));
  }

  async refreshNativeToken() {
    const native: IToken = {
      address: '',
      decimals: 18,
      symbol: Networks.current.symbol,
      price: 0,
      balance: await getBalance(Networks.current.chainId, this.address),
    };

    return native;
  }

  fetchBasicInfo() {
    if (Networks.current.chainId !== 1) return;
    if (this.ensName) return;

    const { currentProvider } = Networks;
    currentProvider.lookupAddress(this.address).then((v) => runInAction(() => (this.ensName = v || this.address)));
    currentProvider.getAvatar(this.ensName || this.address).then((v) => runInAction(() => (this.avatar = v || '')));
  }
}

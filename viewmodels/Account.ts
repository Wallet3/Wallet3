import * as Debank from '../common/apis/Debank';

import { computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../common/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { PublicNetworks } from '../common/Networks';
import TokensMan from './services/TokensMan';
import { formatAddress } from '../utils/formatter';
import { getBalance } from '../common/RPC';
import { utils } from 'ethers';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: IToken[] = [];
  allTokens: IToken[] = [];
  balanceUSD = 0;
  ensName = '';
  avatar = '';

  get displayName() {
    return this.ensName || formatAddress(this.address, 7, 5);
  }

  constructor(address: string, index: number) {
    this.address = '0xC73f6738311E76D45dFED155F39773e68251D251'; // address;
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
    this.refreshNativeToken().then(async (native) => {
      const userTokens = await TokensMan.loadUserTokens(Networks.current.chainId, this.address, Networks.currentProvider);
      userTokens.map((t) => t.getBalance());
      runInAction(() => (this.tokens = [native, ...userTokens]));
    });

    Debank.getBalance(this.address, Networks.current.comm_id).then(({ usd_value }) => {
      runInAction(() => (this.balanceUSD = usd_value));
    });

    // const tokens = (await Debank.getTokens(this.address, Networks.current.comm_id)).map(
    //   (t) =>
    //     new ERC20Token({
    //       ...t,
    //       contract: t.address,
    //       provider: Networks.currentProvider,
    //       owner: this.address,
    //       chainId: Networks.current.chainId,
    //     })
    // );
  }

  async refreshNativeToken() {
    const balance = await getBalance(Networks.current.chainId, this.address);

    const native: IToken = {
      address: '',
      decimals: 18,
      symbol: Networks.current.symbol,
      price: 0,
      balance: balance,
      amount: utils.formatUnits(balance, 18),
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

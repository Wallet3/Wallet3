import * as Debank from '../common/apis/Debank';

import TokensMan, { UserToken } from './services/TokensMan';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../models/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { formatAddress } from '../utils/formatter';
import { getBalance } from '../common/RPC';
import { utils } from 'ethers';

export class Account {
  readonly address: string;
  readonly index: number;

  loadingTokens = false;

  tokens: IToken[] = [];
  allTokens: UserToken[] = [];
  balanceUSD = 0;
  ensName = '';
  avatar = '';
  nativeToken!: IToken;

  get displayName() {
    return this.ensName || formatAddress(this.address, 7, 5);
  }

  constructor(address: string, index: number) {
    this.address = '0x69A8Ff64ed164eD3D757831D425Fdbe904186108'; // address;
    this.index = index;

    makeObservable(this, {
      loadingTokens: observable,
      tokens: observable,
      ensName: observable,
      displayName: computed,
      balanceUSD: observable,
      avatar: observable,
      toggleToken: action,
      sortTokens: action,
      addToken: action,
      refreshOverview: action,
    });
  }

  async refreshOverview() {
    const { current } = Networks;
    this.loadingTokens = true;

    const [native, userTokens, { usd_value }] = await Promise.all([
      this.refreshNativeToken(),
      TokensMan.loadUserTokens(current.chainId, this.address, Networks.currentProvider),
      Debank.getBalance(this.address, current.comm_id),
    ]);

    const shownTokens = userTokens.filter((t) => t.shown);
    const favTokens = [native, ...shownTokens];
    shownTokens.map((t) => t.getBalance());

    runInAction(() => {
      this.tokens = favTokens;
      this.balanceUSD = usd_value;
      this.allTokens = [...userTokens];
      this.loadingTokens = false;
    });

    Debank.getTokens(this.address, Networks.current.comm_id).then((d) => {
      const suggested = d
        .filter((i) => !userTokens.find((fav) => fav.address === i.address))
        .map(
          (t) =>
            new ERC20Token({
              ...t,
              contract: t.address,
              owner: this.address,
              chainId: Networks.current.chainId,
            })
        );

      runInAction(() => (this.allTokens = [...this.allTokens, ...suggested]));
    });
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

    this.nativeToken = native;
    return native;
  }

  fetchBasicInfo() {
    if (Networks.current.chainId !== 1) return;
    if (this.ensName) return;

    const { currentProvider } = Networks;
    currentProvider.lookupAddress(this.address).then((v) => runInAction(() => (this.ensName = v || this.ensName)));
    currentProvider.getAvatar(this.ensName || this.address).then((v) => runInAction(() => (this.avatar = v || '')));
  }

  toggleToken(token: UserToken) {
    token.shown = !token.shown;

    this.tokens = [this.tokens[0], ...this.allTokens.filter((t) => t.shown)];
    (token as ERC20Token).getBalance?.();

    TokensMan.saveUserTokens(Networks.current.chainId, this.address, this.allTokens);
  }

  sortTokens(tokens: UserToken[]) {
    this.allTokens = tokens;
    this.tokens = [this.tokens[0], ...tokens.filter((t) => t.shown)];
    TokensMan.saveUserTokens(Networks.current.chainId, this.address, tokens);
  }

  addToken(token: UserToken) {
    if (this.allTokens.find((t) => t.address === token.address)) return;
    if (this.tokens.find((t) => t.address === token.address)) return;

    token.shown = true;

    this.allTokens = [token, ...this.allTokens];
    this.tokens = [this.tokens[0], token, ...this.tokens.slice(1)];

    TokensMan.saveUserTokens(Networks.current.chainId, this.address, this.allTokens);
  }

  async fetchToken(address: string) {
    if (!utils.isAddress(address)) return;

    const token = new ERC20Token({
      contract: utils.getAddress(address),
      owner: this.address,
      chainId: Networks.current.chainId,
    });

    await Promise.all([token.getBalance(), token.getBalance(), token.getDecimals(), token.getName(), token.getSymbol()]);

    return token;
  }
}

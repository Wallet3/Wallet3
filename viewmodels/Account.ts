import * as Debank from '../common/apis/Debank';

import TokensMan, { UserToken } from './services/TokensMan';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../models/ERC20';
import { IToken } from '../common/Tokens';
import { NativeToken } from '../models/NativeToken';
import Networks from './Networks';
import { formatAddress } from '../utils/formatter';
import { getAvatar } from '../common/ENS';
import { utils } from 'ethers';

export class Account {
  readonly address: string;
  readonly index: number;

  loadingTokens = false;

  tokens: IToken[] = [];
  allTokens: UserToken[] = [];
  balanceUSD = 0;
  ensName = '';
  avatar = 'https://pbs.twimg.com/profile_images/1381803073413210117/AY7Nr1ba_400x400.png';
  nativeToken!: NativeToken;

  get displayName() {
    return this.ensName || formatAddress(this.address, 7, 5);
  }

  constructor(address: string, index: number) {
    this.address = address;
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
      this.createNativeToken(),
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

  private async createNativeToken() {
    const native =
      this.nativeToken ||
      new NativeToken({
        owner: this.address,
        chainId: Networks.current.chainId,
        symbol: Networks.current.symbol,
      });

    native.setChain({ ...Networks.current });
    native.getBalance();

    this.nativeToken = native;

    return native as unknown as ERC20Token;
  }

  async refreshTokensBalance() {
    const [{ usd_value }, _] = await Promise.all([
      Debank.getBalance(this.address, Networks.current.comm_id),
      this.tokens.map((t) => (t as ERC20Token).getBalance?.(false)),
    ]);

    runInAction(() => (this.balanceUSD = usd_value));
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

  toggleToken(token: UserToken) {
    token.shown = !token.shown;

    this.tokens = [this.tokens[0], ...this.allTokens.filter((t) => t.shown)];
    if (token.shown) (token as ERC20Token).getBalance?.();

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

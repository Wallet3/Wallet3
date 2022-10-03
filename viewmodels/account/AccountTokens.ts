import * as Debank from '../../common/apis/Debank';

import TokensMan, { UserToken } from '../services/TokensMan';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../../models/ERC20';
import LINQ from 'linq';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import { sha256 } from '../../utils/cipher';
import { utils } from 'ethers';

export class AccountTokens {
  private lastRefreshTime = 0;

  owner: string;

  tokens: UserToken[] = []; // favorite tokens
  allTokens: UserToken[] = [];
  nativeToken!: NativeToken;
  loadingTokens = false;
  balanceUSD = 0;

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, {
      loadingTokens: observable,
      tokens: observable,
      balanceUSD: observable,
      toggleToken: action,
      sortTokens: action,
      addToken: action,
      refreshOverview: action,
    });

    this.refreshNativeToken();
  }

  async refreshOverview() {
    const { current } = Networks;
    this.loadingTokens = true;

    const [native, userTokens] = await Promise.all([
      this.refreshNativeToken(),
      TokensMan.loadUserTokens(current.chainId, this.owner),
    ]);

    const shownTokens = userTokens.filter((t) => t.shown);
    const favTokens = [native, ...shownTokens];

    shownTokens.map((t) => t.getBalance());

    runInAction(() => {
      this.tokens = favTokens;
      this.allTokens = userTokens;
      this.loadingTokens = false;
    });

    const [userBalance, debankTokens] = await Promise.all([
      Debank.getBalance(this.owner, current.comm_id),
      Debank.getTokens(this.owner, Networks.current.comm_id),
    ]);

    const suggested = debankTokens
      .filter((i) => !userTokens.find((fav) => fav.address === i.address))
      .map(
        (t) =>
          new ERC20Token({
            ...t,
            contract: t.address,
            owner: this.owner,
            chainId: Networks.current.chainId,
          })
      );

    runInAction(() => {
      this.balanceUSD = userBalance?.usd_value ?? this.balanceUSD;
      this.allTokens = [...this.allTokens, ...suggested];
    });
  }

  async refreshNativeToken() {
    if (this.nativeToken?.chainId === Networks.current.chainId && this.lastRefreshTime > Date.now() - 3 * 1000)
      return this.nativeToken;

    const native =
      this.nativeToken ||
      new NativeToken({
        owner: this.owner,
        ...Networks.current,
      });

    native.setChain({ ...Networks.current });
    native.getBalance();

    this.nativeToken = native;
    this.lastRefreshTime = Date.now();

    return native as unknown as ERC20Token;
  }

  async refreshTokensBalance() {
    const [balance, _] = await Promise.all([
      Debank.getBalance(this.owner, Networks.current.comm_id),
      this.tokens.map((t) => (t as ERC20Token).getBalance?.(false)),
    ]);

    if (!balance) return;

    const tokensSnapshotHash = await sha256(
      this.tokens.reduce((prev, curr) => `${prev}_${curr.symbol}:${curr.balance?.toString()}`, '')
    );

    runInAction(() => (this.balanceUSD = balance.usd_value));
  }

  toggleToken(token: UserToken) {
    token.shown = !token.shown;

    this.allTokens = [
      ...this.allTokens.filter((t) => t.shown && t.address !== token.address),
      token,
      ...this.allTokens.filter((t) => !t.shown && t.address !== token.address),
    ];

    this.tokens = [this.tokens[0], ...this.allTokens.filter((t) => t.shown)];
    if (token.shown) (token as ERC20Token).getBalance?.();

    TokensMan.saveUserTokens(Networks.current.chainId, this.owner, this.allTokens);
  }

  sortTokens(tokens: UserToken[]) {
    this.allTokens = tokens;
    this.tokens = [this.tokens[0], ...tokens.filter((t) => t.shown)];
    TokensMan.saveUserTokens(Networks.current.chainId, this.owner, tokens);
  }

  async addToken(token: UserToken, targetChainId = Networks.current.chainId) {
    if (!token.address) return;

    const currentChainId = Networks.current.chainId;

    const tokens =
      targetChainId === currentChainId ? this.allTokens : await TokensMan.loadUserTokens(targetChainId, this.owner);

    const found = tokens.find((t) => t.address.toLowerCase() === token.address.toLowerCase());

    if (found) {
      if (targetChainId === currentChainId) {
        if (!found.shown) runInAction(() => this.toggleToken(found));
      } else {
        found.shown = true;
        TokensMan.saveUserTokens(targetChainId, this.owner, tokens);
      }

      return;
    }

    token.shown = true;
    (token as ERC20Token).getBalance?.();

    if (targetChainId === Networks.current.chainId) {
      runInAction(() => {
        this.allTokens.unshift(token);
        this.tokens.splice(1, 0, token);
      });
    }

    TokensMan.saveUserTokens(targetChainId, this.owner, [
      token,
      ...(await TokensMan.loadUserTokens(targetChainId, this.owner)),
    ]);
  }

  async fetchToken(address: string) {
    if (!utils.isAddress(address)) return;

    const token = new ERC20Token({
      contract: address,
      owner: this.owner,
      chainId: Networks.current.chainId,
    });

    try {
      await Promise.all([token.getBalance(), token.getBalance(), token.getDecimals(), token.getName(), token.getSymbol()]);
    } catch (error) {
      return;
    }

    return token;
  }
}

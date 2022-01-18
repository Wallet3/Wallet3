import * as Debank from '../../common/apis/Debank';

import TokensMan, { UserToken } from '../services/TokensMan';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../../models/ERC20';
import { IToken } from '../../common/Tokens';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import { utils } from 'ethers';

export class AccountTokens {
  owner: string;

  tokens: UserToken[] = [];
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

    this.createNativeToken();
  }

  async refreshOverview() {
    const { current } = Networks;
    this.loadingTokens = true;

    const [native, userTokens, userBalance] = await Promise.all([
      this.nativeToken,
      TokensMan.loadUserTokens(current.chainId, this.owner),
      Debank.getBalance(this.owner, current.comm_id),
    ]);

    const shownTokens = userTokens.filter((t) => t.shown);
    const favTokens = [native, ...shownTokens];

    shownTokens.map((t) => t.getBalance());

    runInAction(() => {
      this.tokens = favTokens;
      this.balanceUSD = userBalance?.usd_value ?? this.balanceUSD;
      this.allTokens = [...userTokens];
      this.loadingTokens = false;
    });

    Debank.getTokens(this.owner, Networks.current.comm_id).then((d) => {
      const suggested = d
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

      runInAction(() => (this.allTokens = [...this.allTokens, ...suggested]));
    });
  }

  private async createNativeToken() {
    const native =
      this.nativeToken ||
      new NativeToken({
        owner: this.owner,
        chainId: Networks.current.chainId,
        symbol: Networks.current.symbol,
      });

    native.setChain({ ...Networks.current });
    native.getBalance();

    this.nativeToken = native;

    return native as unknown as ERC20Token;
  }

  async refreshTokensBalance() {
    const [balance, _] = await Promise.all([
      Debank.getBalance(this.owner, Networks.current.comm_id),
      this.tokens.map((t) => (t as ERC20Token).getBalance?.(false)),
    ]);

    if (!balance) return;
    runInAction(() => (this.balanceUSD = balance.usd_value));
  }

  toggleToken(token: UserToken) {
    token.shown = !token.shown;

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

    const found = tokens.find((t) => t.address === token.address);

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
      contract: utils.getAddress(address),
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

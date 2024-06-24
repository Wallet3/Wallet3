import * as Debank from '../../../common/apis/Debank';

import { BigNumber, utils } from 'ethers';
import TokensMan, { UserToken } from '../../services/TokensMan';
import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../../../models/ERC20';
import { IFungibleToken } from '../../../models/Interfaces';
import { ITokenMetadata } from '../../../common/tokens';
import { NativeToken } from '../../../models/NativeToken';
import Networks from '../../core/Networks';
import { clearBalanceCache } from '../../../common/apis/Debank';
import { logAddToken } from '../../services/Analytics';

const Keys = {
  tokensDigest: (chainId: number, owner: string) => `${chainId}_${owner}_tokens_digest`,
};

export class AccountTokens {
  private lastRefreshTime = 0;
  private preDigest = '';

  owner: string;

  tokens: IFungibleToken[] = []; // favorite tokens
  allTokens: IFungibleToken[] = [];
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

    this.preDigest = (await AsyncStorage.getItem(Keys.tokensDigest(current.chainId, this.owner))) || '';

    const shownTokens = userTokens.filter((t) => t.shown);
    const favTokens = [native, ...shownTokens];

    shownTokens.map((t) => t.getBalance());

    runInAction(() => {
      this.tokens = favTokens;
      this.allTokens = userTokens;
      this.loadingTokens = false;
    });

    const [userBalance, debankTokens] = await Promise.all([
      Debank.getBalance(this.owner, current.chainId, current.comm_id),
      Debank.getTokens(this.owner, current.chainId, current.comm_id),
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
    const { current } = Networks;

    await Promise.all(this.tokens.map((t) => (t as ERC20Token).getBalance?.(false)));

    if (this.tokens.every((t) => (t.balance as BigNumber)?.eq?.(0))) return;

    const curDigest = this.tokens
      .filter((t) => (t.balance as BigNumber)?.gt(0))
      .sort((t1, t2) => (t1.symbol > t2.symbol ? 1 : -1))
      .reduce((prev, curr) => `${prev}_${curr.symbol}:${curr.balance?.toString()}`, '');

    if (this.preDigest !== curDigest) {
      clearBalanceCache(this.owner, this.nativeToken.chainId);
      await AsyncStorage.setItem(Keys.tokensDigest(this.nativeToken.chainId, this.owner), curDigest);
      this.preDigest = curDigest;
    }

    const balance = await Debank.getBalance(this.owner, current.chainId, current.comm_id);
    if (!balance) return;

    runInAction(() => (this.balanceUSD = balance.usd_value));
  }

  toggleToken(token: IFungibleToken) {
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

  sortTokens(tokens: IFungibleToken[]) {
    this.allTokens = tokens;
    this.tokens = [this.tokens[0], ...tokens.filter((t) => t.shown)];
    TokensMan.saveUserTokens(Networks.current.chainId, this.owner, tokens);
  }

  async addToken(token: IFungibleToken, targetChainId = Networks.current.chainId) {
    if (!token.address) return;
    const lower = token.address.toLowerCase();

    const currentChainId = Networks.current.chainId;

    const tokens: IFungibleToken[] =
      targetChainId === currentChainId ? this.allTokens : await TokensMan.loadUserTokens(targetChainId, this.owner);

    const found = tokens.find((t) => t.address.toLowerCase() === lower);

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
    (token as ERC20Token).setOwner?.(this.owner);
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

    logAddToken({ chainId: targetChainId, token: token.address });
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

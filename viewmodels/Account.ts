import * as Debank from '../common/apis/Debank';

import TokensMan, { UserToken } from './services/TokensMan';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ERC20Token } from '../common/ERC20';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
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
      toggleToken: action,
      sortTokens: action,
      addToken: action,
    });
  }

  async refreshOverview() {
    const { current } = Networks;

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
    });

    Debank.getTokens(this.address, Networks.current.comm_id).then((d) => {
      const suggested = d
        .filter((i) => !userTokens.find((fav) => fav.address === i.address))
        .map(
          (t) =>
            new ERC20Token({
              ...t,
              contract: t.address,
              provider: Networks.currentProvider,
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

    return native;
  }

  fetchBasicInfo() {
    if (Networks.current.chainId !== 1) return;
    if (this.ensName) return;

    const { currentProvider } = Networks;
    currentProvider.lookupAddress(this.address).then((v) => runInAction(() => (this.ensName = v || this.address)));
    currentProvider.getAvatar(this.ensName || this.address).then((v) => runInAction(() => (this.avatar = v || '')));
  }

  toggleToken(token: UserToken) {
    token.shown = !token.shown;

    const index = this.tokens.indexOf(token);

    if (token.shown && index === -1) {
      (token as ERC20Token).getBalance?.();
      const tokens = [...this.tokens];
      tokens.splice(this.allTokens.indexOf(token) + 1, 0, token);
      this.tokens = tokens;
    } else {
      if (index >= 0) this.tokens = [...this.tokens.slice(0, index), ...this.tokens.slice(index + 1)];
    }

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
      provider: Networks.currentProvider,
    });

    await Promise.all([token.getBalance(), token.getBalance(), token.getDecimals(), token.getName(), token.getSymbol()]);

    return token;
  }
}

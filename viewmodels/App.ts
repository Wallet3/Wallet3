import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Bookmarks from './customs/Bookmarks';
import Coingecko from '../common/apis/Coingecko';
import Contacts from './customs/Contacts';
import Database from '../models/Database';
import InpageMetamaskDAppHub from './hubs/InpageMetamaskDAppHub';
import LinkHub from './hubs/LinkHub';
import Networks from './Networks';
import TxHub from './hubs/TxHub';
import { Wallet } from './Wallet';
import WalletConnectV1ClientHub from './walletconnect/WalletConnectV1ClientHub';

export class AppVM {
  private lastRefreshedTime = 0;
  private refreshTimer!: NodeJS.Timer;

  initialized = false;
  wallets: Wallet[] = [];
  currentAccount: Account | null = null;

  get hasWallet() {
    return this.wallets.length > 0;
  }

  get allAccounts() {
    return this.wallets.map((wallet) => wallet.accounts).flat();
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      wallets: observable,
      hasWallet: computed,
      reset: action,
      switchAccount: action,
      currentAccount: observable,
      newAccount: action,
      removeAccount: action,
    });

    reaction(
      () => Networks.current,
      () => {
        this.currentAccount?.tokens.refreshOverview();
      }
    );
  }

  findWallet(account: string) {
    const wallet = this.wallets.find((w) => w.accounts.find((a) => a.address === account));
    if (!wallet) return;

    return { wallet, accountIndex: wallet.accounts.findIndex((a) => a.address === account) };
  }

  findAccount(account: string) {
    return this.allAccounts.find((a) => a.address === account);
  }

  newAccount() {
    this.wallets[0]?.newAccount();
    this.switchAccount(this.allAccounts[this.allAccounts.length - 1].address);
  }

  switchAccount(address: string, force = false) {
    if (this.currentAccount?.address === address) return;

    let target = this.findAccount(address);
    if (!target && !force) return;

    target = target ?? this.allAccounts[0];
    if (!target) return;

    target.tokens.refreshOverview();
    this.currentAccount = target;

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 20);
    AsyncStorage.setItem('lastUsedAccount', target.address);
  }

  removeAccount(account: Account) {
    this.findWallet(account.address)?.wallet.removeAccount(account);
    this.switchAccount(this.allAccounts[0].address);
  }

  async refreshAccount() {
    if (Date.now() - this.lastRefreshedTime < 1000 * 5) return;
    this.lastRefreshedTime = Date.now();

    clearTimeout(this.refreshTimer);
    await this.currentAccount?.tokens.refreshTokensBalance();

    this.refreshTimer = setTimeout(() => this.refreshAccount(), 10 * 1000);
  }

  async init() {
    Coingecko.init();

    await Promise.all([Database.init(), Authentication.init()]);
    await Promise.all([TxHub.init(), Networks.init()]);

    const wallets = await Promise.all((await Database.keys.find()).map((key) => new Wallet(key).init()));
    const lastUsedAccount = (await AsyncStorage.getItem('lastUsedAccount')) ?? '';

    Authentication.once('appAuthorized', () => {
      WalletConnectV1ClientHub.init();
      LinkHub.start();
    });

    runInAction(() => {
      this.initialized = true;
      this.wallets = wallets;
      this.switchAccount(lastUsedAccount, true);
    });
  }

  async reset() {
    this.wallets.forEach((w) => w.dispose());
    this.wallets = [];
    this.currentAccount = null;

    TxHub.reset();
    Contacts.reset();
    Networks.reset();
    Bookmarks.reset();

    await Promise.all([
      Database.reset(),
      AsyncStorage.clear(),
      Authentication.reset(),
      WalletConnectV1ClientHub.reset(),
      InpageMetamaskDAppHub.reset(),
    ]);
  }
}

export default new AppVM();

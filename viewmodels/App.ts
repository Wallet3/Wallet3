import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Bookmarks from './customs/Bookmarks';
import Coingecko from '../common/apis/Coingecko';
import Contacts from './customs/Contacts';
import Database from '../models/Database';
import InpageMetamaskDAppHub from './hubs/InpageMetamaskDAppHub';
import Key from '../models/Key';
import LINQ from 'linq';
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
    return LINQ.from(this.wallets.map((wallet) => wallet.accounts).flat())
      .distinct((a) => a.address)
      .toArray();
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
      allAccounts: computed,
    });

    reaction(
      () => Networks.current,
      () => {
        this.currentAccount?.tokens.refreshOverview();
        this.allAccounts.forEach((a) => a.tokens.refreshNativeToken());
      }
    );
  }

  async addWallet(key: Key) {
    if (this.wallets.find((w) => w.isSameKey(key))) return;

    const wallet = await new Wallet(key).init();
    runInAction(() => {
      this.wallets.push(wallet);
      this.switchAccount(wallet.accounts[0].address);
    });
  }

  findWallet(accountAddress: string) {
    const wallet = this.wallets.find((w) => w.accounts.find((a) => a.address === accountAddress));
    if (!wallet) return;

    const account = wallet.accounts.find((a) => a.address === accountAddress);
    if (!account) return;

    return { wallet, accountIndex: account.index, account };
  }

  findAccount(account: string) {
    return this.allAccounts.find((a) => a.address === account);
  }

  newAccount() {
    let { wallet } = this.findWallet(this.currentAccount!.address) || {};
    let account: Account;

    if (wallet?.hdWallet) {
      account = wallet.newAccount();
    } else {
      wallet = this.wallets.find((w) => w.hdWallet);
      account = wallet!.newAccount();
    }

    this.switchAccount(account.address);
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
    if (this.allAccounts.length === 1) return;

    const isCurrentAccount = account.address === this.currentAccount?.address;
    const index = this.allAccounts.indexOf(account);

    this.findWallet(account.address)?.wallet.removeAccount(account);

    if (isCurrentAccount) this.switchAccount(this.allAccounts[Math.max(0, index - 1)].address);
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

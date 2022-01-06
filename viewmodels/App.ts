import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Bookmarks from './hubs/Bookmarks';
import Coingecko from '../common/apis/Coingecko';
import Contacts from './hubs/Contacts';
import Database from '../models/Database';
import LinkHub from './hubs/LinkHub';
import Networks from './Networks';
import TxHub from './hubs/TxHub';
import { Wallet } from './Wallet';
import WalletConnectV1ClientHub from './hubs/WalletConnectV1ClientHub';

export class AppVM {
  initialized = false;
  wallets: Wallet[] = [];
  currentWallet: Wallet | null = null;

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
      currentWallet: observable,
      hasWallet: computed,
      reset: action,
    });
  }

  async init() {
    Coingecko.init();

    await Promise.all([Database.init(), Authentication.init()]);

    const wallets = await Promise.all((await Database.keyRepository.find()).map((key) => new Wallet(key).init()));

    await Promise.all([TxHub.init()]);

    Authentication.once('appAuthorized', () => {
      WalletConnectV1ClientHub.init();
      LinkHub.start();
    });

    runInAction(() => {
      this.initialized = true;
      this.wallets = wallets;
      this.currentWallet = wallets[0];
    });
  }

  async reset() {
    this.wallets.forEach((w) => w.dispose());
    this.wallets = [];
    this.currentWallet = null;
    TxHub.reset();
    Contacts.reset();
    Networks.reset();
    Bookmarks.reset();
    await Promise.all([Database.reset(), AsyncStorage.clear(), Authentication.reset(), WalletConnectV1ClientHub.reset()]);
  }
}

export default new AppVM();

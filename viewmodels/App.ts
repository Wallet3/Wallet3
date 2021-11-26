import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Coingecko from '../common/apis/Coingecko';
import DAppHub from './DAppHub';
import Database from '../models/Database';
import TxHub from './TxHub';
import UrlHub from './UrlHub';
import { Wallet } from './Wallet';

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
      DAppHub.init();
      UrlHub.start();
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
    await Promise.all([Database.reset(), AsyncStorage.clear(), Authentication.reset(), DAppHub.reset()]);
  }
}

export default new AppVM();

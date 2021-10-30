import { computed, keys, makeObservable, observable, runInAction } from 'mobx';

import Authentication from './Authentication';
import Database from '../models/Database';
import { Wallet } from './Wallet';

export class AppVM {
  initialized = false;
  wallets: Wallet[] = [];

  get hasWallet() {
    return this.wallets.length > 0;
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      wallets: observable,
      hasWallet: computed,
    });
  }

  async init() {
    await Promise.all([Database.init(), Authentication.init()]);
    const wallets = await Promise.all((await Database.keyRepository.find()).map((key) => new Wallet(key).init()));

    runInAction(() => {
      this.initialized = true;
      this.wallets = wallets;
    });
  }

  dispose() {
    Database.dispose();
  }
}

export default new AppVM();

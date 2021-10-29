import { computed, keys, makeObservable, observable, runInAction } from 'mobx';

import Authentication from './Authentication';
import Database from '../models/Database';
import { Wallet } from './Wallet';

export class AppVM {
  initialized = false;
  keys: Wallet[] = [];

  get hasWallet() {
    return this.keys.length > 0;
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      keys: observable,
      hasWallet: computed,
    });
  }

  async init() {
    await Promise.all([Database.init(), Authentication.init()]);
    const keys = (await Database.keyRepository.find()).map((key) => new Wallet(key));

    runInAction(() => {
      this.initialized = true;
      this.keys = keys;
    });
  }

  dispose() {
    Database.dispose();
  }
}

export default new AppVM();

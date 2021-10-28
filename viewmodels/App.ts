import { computed, keys, makeObservable, observable, runInAction } from 'mobx';

import Authentication from './Authentication';
import Database from '../models/Database';
import { WalletKey } from './WalletKey';

export class AppVM {
  initialized = false;
  keys: WalletKey[] = [];

  get hasKeys() {
    return this.keys.length > 0;
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      keys: observable,
      hasKeys: computed,
    });
  }

  async init() {
    await Promise.all([Database.init(), Authentication.init()]);
    const keys = (await Database.keyRepository.find()).map((key) => new WalletKey(key));

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

import { makeObservable, observable, runInAction } from 'mobx';

import Database from '../models/Database';
import { WalletKey } from './WalletKey';

export class App {
  initialized = false;
  keys: WalletKey[] = [];

  constructor() {
    makeObservable(this, {
      initialized: observable,
      keys: observable,
    });
  }

  async init() {
    await Database.init();
    const keys = (await Database.keyRepository.find()).map((key) => new WalletKey(key));
    console.log(keys.length);

    runInAction(() => {
      this.initialized = true;
      this.keys = keys;
    });
  }
}

export default new App();

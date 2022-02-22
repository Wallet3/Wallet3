import { action, makeObservable, observable, runInAction } from 'mobx';
import Database from '../../models/Database';
import InpageDApp from '../../models/InpageDApp';
import { MetamaskDApp } from './MetamaskDApp';

class MetamaskDAppsHub {
  dapps: MetamaskDApp[] = [];

  constructor() {
    makeObservable(this, { dapps: observable, remove: action, add: action });
  }

  async init() {
    const dapps = await Database.inpageDApps.find();
    const items = dapps.map((app) => {
      const item = new MetamaskDApp(app);
      item.once('removed', (obj) => this.remove(obj));
      return item;
    });

    runInAction(() => (this.dapps = items));
  }

  remove(dapp: MetamaskDApp) {
    this.dapps = this.dapps.filter((i) => i !== dapp);
  }

  add(dapp: InpageDApp) {
    const item = new MetamaskDApp(dapp);
    item.once('removed', (obj) => this.remove(obj));
    this.dapps = [...this.dapps, item];
  }
}

export default new MetamaskDAppsHub();

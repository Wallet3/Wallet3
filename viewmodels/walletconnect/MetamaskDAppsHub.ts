import { action, makeObservable, observable, runInAction } from 'mobx';
import Database from '../../models/Database';
import InpageDApp from '../../models/InpageDApp';
import { MetamaskDApp } from './MetamaskDApp';

class MetamaskDAppsHub {
  private cache = new Map<string, MetamaskDApp>();

  dapps: MetamaskDApp[] = [];

  constructor() {
    makeObservable(this, { dapps: observable, remove: action, add: action, reset: action, removeAccount: action });
  }

  async init() {
    const dapps = await Database.inpageDApps.find();
    const items = dapps.map((app) => {
      const item = new MetamaskDApp(app);
      item.once('removed', (obj) => this.remove(obj));
      this.cache.set(item.hostname, item);
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
    this.cache.set(item.hostname, item);
    this.dapps = [...this.dapps, item];
  }

  find(hostname: string) {
    let dapp = this.cache.get(hostname);
    if (dapp) return dapp;

    const item = this.dapps.find((dapp) => dapp.hostname === hostname);
    if (!item) return undefined;

    this.cache.set(hostname, item);
    return item;
  }

  async removeAccount(address: string) {
    const items = this.dapps.filter((d) => d.lastUsedAccount === address);
    this.dapps = this.dapps.filter((d) => d.lastUsedAccount !== address);

    items.map((i) => {
      i.removeAllListeners();
      this.cache.delete(i.hostname);
      i.killSession();
    });
  }

  reset() {
    this.dapps = [];
    this.cache.clear();
  }
}

export default new MetamaskDAppsHub();

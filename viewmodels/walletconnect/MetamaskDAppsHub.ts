import { action, makeObservable, observable, runInAction } from 'mobx';

import Database from '../../models/Database';
import InpageDApp from '../../models/entities/InpageDApp';
import LINQ from 'linq';
import { MetamaskDApp } from './MetamaskDApp';

class MetamaskDAppsHub {
  private cache = new Map<string, MetamaskDApp>();

  dapps: MetamaskDApp[] = [];

  constructor() {
    makeObservable(this, { dapps: observable, remove: action, add: action, reset: action, removeAccount: action });
  }

  async init() {
    let dapps = await Database.inpageDApps.find();
    const expiredTime = Date.now() - 1000 * 60 * 60 * 24 * 30;
    dapps.filter((d) => d.lastUsedTimestamp < expiredTime).map((item) => item.remove());

    const items = LINQ.from(dapps)
      .where((d) => d.lastUsedTimestamp >= expiredTime)
      .orderByDescending((d) => d.lastUsedTimestamp)
      .select((app) => {
        const item = new MetamaskDApp(app);
        item.once('removed', (obj) => this.remove(obj));
        this.cache.set(item.hostname, item);
        return item;
      })
      .toArray();

    runInAction(() => (this.dapps = items));
  }

  remove(dapp: MetamaskDApp) {
    this.cache.delete(dapp.hostname);
    this.dapps = this.dapps.filter((i) => i !== dapp);
  }

  add(dapp: InpageDApp) {
    const item = new MetamaskDApp(dapp);
    item.once('removed', (obj) => this.remove(obj));
    this.cache.set(item.hostname, item);
    this.dapps.unshift(item);
  }

  find(hostname: string) {
    let dapp = this.cache.get(hostname);
    if (dapp) return dapp;

    const item = this.dapps.find((dapp) => dapp.hostname === hostname);
    if (!item) return undefined;

    item.setLastUsedTimestamp(Date.now());
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
    this.dapps.forEach((dapp) => dapp.removeAllListeners());

    this.dapps = [];
    this.cache.clear();
  }
}

export default new MetamaskDAppsHub();

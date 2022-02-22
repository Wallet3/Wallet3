import { action, makeObservable, observable, runInAction } from 'mobx';
import Database from '../../models/Database';
import InpageDApp from '../../models/InpageDApp';
import { MetamaskDApp } from './MetamaskDApp';

export class MetamaskDAppsHub {
  dapps: MetamaskDApp[] = [];

  constructor() {
    makeObservable(this, { dapps: observable, remove: action });

    Database.inpageDApps.find().then((dapps) => {
      runInAction(() => (this.dapps = dapps.map((app) => new MetamaskDApp(app))));
    });
  }

  remove(dapp: InpageDApp) {
    dapp.remove();
  }
}

import { computed, makeObservable, observable, runInAction } from 'mobx';

import Database from '../../../models/Database';
import { PairedDevice } from './PairedDevice';

class PairedDevices {
  devices: PairedDevice[] = [];

  get hasDevices() {
    return this.devices.length > 0;
  }

  constructor() {
    makeObservable(this, { devices: observable, hasDevices: computed });
  }

  async refresh() {
    console.log('refresh paired devices');
    if (this.devices.length > 0) return;

    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
  }
}

export default new PairedDevices();

import { computed, makeObservable, observable, runInAction } from 'mobx';

import Database from '../../../models/Database';
import MessageKeys from '../../../common/MessageKeys';
import { PairedDevice } from './PairedDevice';
import ShardKey from '../../../models/entities/ShardKey';

class PairedDevices {
  devices: PairedDevice[] = [];

  get hasDevices() {
    return this.devices.length > 0;
  }

  constructor() {
    makeObservable(this, { devices: observable, hasDevices: computed });
  }

  async refresh() {
    if (this.devices.length > 0) return;

    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
  }

  addShardKey(key: ShardKey) {
    const device = new PairedDevice(key);
    if (this.devices.find((d) => d.id === device.id)) return;

    runInAction(() => this.devices.push(device));
  }

  removeDevice(device: PairedDevice) {
    const index = this.devices.indexOf(device);
    if (index < 0) return;

    device.remove();
    runInAction(() => this.devices.splice(index, 1));
  }
}

export default new PairedDevices();

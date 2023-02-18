import { computed, makeObservable, observable, runInAction } from 'mobx';

import Database from '../../../models/Database';
import LanDiscovery from '../../../common/p2p/LanDiscovery';
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

  async init() {
    const count = (await this.refresh()).length;
    if (count === 0) return;

    LanDiscovery.scan();
  }

  async refresh() {
    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
    return keys;
  }

  addShardKey(key: ShardKey) {
    const device = new PairedDevice(key);
    if (this.devices.find((d) => d.id === device.id)) return;

    runInAction(() => this.devices.push(device));
  }

  removeDevice(device: PairedDevice) {
    const index = this.devices.findIndex((d) => d.id === device.id);
    if (index < 0) return;

    device.remove();
    runInAction(() => this.devices.splice(index, 1));
  }
}

export default new PairedDevices();

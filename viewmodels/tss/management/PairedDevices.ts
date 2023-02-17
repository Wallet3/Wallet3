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
    PubSub.subscribe(MessageKeys.newDevicePaired, (_, key) => this.onNewDevicePaired(key));
  }

  async refresh() {
    if (this.devices.length > 0) return;

    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
  }

  protected onNewDevicePaired = (key: ShardKey) => {
    const device = new PairedDevice(key);

    if (this.devices.find((d) => d.id === device.id)) return;
    runInAction(() => this.devices.push(device));
  };
}

export default new PairedDevices();

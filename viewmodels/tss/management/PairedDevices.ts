import { computed, makeObservable, observable, runInAction } from 'mobx';

import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import LanDiscovery from '../../../common/p2p/LanDiscovery';
import MessageKeys from '../../../common/MessageKeys';
import { PairedDevice } from './PairedDevice';
import ShardKey from '../../../models/entities/ShardKey';
import { ShardProvider } from '../ShardProvider';
import { openShardProvider } from '../../../common/Modals';

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

    this.scanLan();
  }

  private scanLan() {
    LanDiscovery.scan();

    LanDiscovery.on('shardsAggregatorFound', (service) => {
      console.log('aggregator', service);
      
      if (!service) return;
      const id = service.txt?.['distributionId'];
      const devices = this.devices.filter((d) => d.distributionId === id);
      if (devices.length === 0) return;

      const device = devices.find((d) => d.deviceInfo.globalId === (service.txt?.info as ClientInfo).globalId);
      if (!device) return;

      openShardProvider(new ShardProvider({ service, shardKey: device.shard }));
    });
  }

  async refresh() {
    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
    return keys;
  }

  addShardKey(key: ShardKey) {
    const device = new PairedDevice(key);
    if (this.devices.find((d) => d.id === device.id)) return;

    this.devices.length === 0 && this.scanLan();
    runInAction(() => this.devices.push(device));
  }

  removeDevice(device: PairedDevice) {
    const index = this.devices.findIndex((d) => d.id === device.id);
    index >= 0 && runInAction(() => this.devices.splice(index, 1));

    device.remove();

    index >= 0 && this.devices.length <= 1 && LanDiscovery.stop();
  }
}

export default new PairedDevices();

import DistributorDiscovery, { handleRawService } from './DistributorDiscovery';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../../common/p2p/Bonjour';
import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import { KeyAggregationService } from '../Constants';
import MessageKeys from '../../../common/MessageKeys';
import { PairedDevice } from './PairedDevice';
import { Service } from 'react-native-zeroconf';
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
    Bonjour.on('resolved', this.handleService);
  }

  async init() {
    const count = (await this.refresh()).length;
    if (count === 0) return;

    this.scanLan();
  }

  private handleService = (raw: Service) => {
    const { shardsAggregation: service } = handleRawService(raw);
    if (!service) return;

    const id = service.txt?.['distributionId'];
    const devices = this.devices.filter((d) => d.distributionId === id);
    if (devices.length === 0) return;

    const device = devices.find((d) => d.deviceInfo.globalId === (service.txt?.info as ClientInfo).globalId);
    if (!device) return;

    openShardProvider({ vm: new ShardProvider({ service, shardKey: device.shard }), onClosed: () => this.scanLan() });
  };

  private scanLan = () => Bonjour.scan(KeyAggregationService);

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
  }
}

export default new PairedDevices();

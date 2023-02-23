import { computed, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../../common/p2p/Bonjour';
import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import { KeyAggregationService } from '../Constants';
import { PairedDevice } from './PairedDevice';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import ShardKey from '../../../models/entities/ShardKey';
import { ShardProvider } from '../ShardProvider';
import { handleRawService } from './DistributorDiscovery';
import { openShardProvider } from '../../../common/Modals';

class PairedDevices {
  private handledIds = new Set<string>();
  private handlingIds = new Set<string>();

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

    const reqId = service.txt?.['reqId'];
    if (this.handledIds.has(reqId) || this.handlingIds.has(reqId)) {
      setTimeout(() => this.scanLan(), 10 * SECOND);
      return;
    }

    const id = service.txt?.['distributionId'];
    const devices = this.devices.filter((d) => d.distributionId === id);
    if (devices.length === 0) return;

    const device = devices.find((d) => d.deviceInfo.globalId === (service.txt?.info as ClientInfo).globalId);
    if (!device) return;

    const vm = new ShardProvider({ service, shardKey: device.shard });
    vm.once('shardSent' as any, () => this.handledIds.add(reqId));

    openShardProvider({
      vm,
      onClosed: () => {
        vm.removeAllListeners();
        this.handlingIds.delete(reqId);
        setTimeout(() => this.scanLan(), 10 * SECOND);
      },
    });
  };

  scanLan = () => this.hasDevices && Bonjour.scan(KeyAggregationService);

  async refresh() {
    const keys = await Database.shardKeys!.find();
    runInAction(() => (this.devices = keys.map((key) => new PairedDevice(key))));
    return keys;
  }

  async addShardKey(key: ShardKey) {
    const device = new PairedDevice(key);
    if (this.devices.find((d) => d.id === device.id)) return;

    await runInAction(async () => (this.devices = this.devices.concat(device)));
    setTimeout(() => this.scanLan(), 10 * SECOND);
  }

  removeDevice(device: PairedDevice) {
    const index = this.devices.findIndex((d) => d.id === device.id);
    index >= 0 && runInAction(() => (this.devices = this.devices.filter((d) => d.id !== device.id)));

    device.remove();
  }

  findDistributor(name: string) {
    return this.devices.find((d) => d.bonjourDistributorName === name);
  }
}

export default new PairedDevices();

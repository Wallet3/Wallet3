import { computed, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../../common/p2p/Bonjour';
import { ClientInfo } from '../../../common/p2p/Constants';
import Database from '../../../models/Database';
import { KeyManagementService } from '../Constants';
import { PairedDevice } from './PairedDevice';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import ShardKey from '../../../models/entities/ShardKey';
import { ShardProvider } from '../ShardProvider';
import { handleRawService } from './DistributorDiscovery';
import { openShardProvider } from '../../../common/Modals';
import { sha256Sync } from '../../../utils/cipher';

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
    await this.refresh();
  }

  private handleService = (raw: Service) => {
    const { shardsAggregation: service } = handleRawService(raw);
    if (!service) return;

    const reqId = service.txt?.['reqId'];
    const verHash = service.txt?.['version'];
    if (this.handledIds.has(reqId) || this.handlingIds.has(reqId)) {
      setTimeout(() => this.scanLan(), 10 * SECOND);
      return;
    }

    const id = service.txt?.['distributionId'];
    const devices = this.devices.filter((d) => d.distributionId === id);
    if (devices.length === 0) return;

    const device = devices.find((d) => d.deviceInfo.globalId === (service.txt?.info as ClientInfo).globalId);
    if (!device) return;
    if (sha256Sync(device.shard.secretsInfo.version).substring(0, 16) !== verHash) return;

    const vm = new ShardProvider({ service, shardKey: device.shard });
    vm.once('shardSent' as any, () => this.handledIds.add(reqId));

    this.handlingIds.add(reqId);
    openShardProvider({
      vm,
      onClosed: () => {
        vm.removeAllListeners();
        this.handlingIds.delete(reqId);
        setTimeout(() => this.scanLan(), 10 * SECOND);
      },
    });
  };

  scanLan = () => this.hasDevices && Bonjour.scan(KeyManagementService);

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

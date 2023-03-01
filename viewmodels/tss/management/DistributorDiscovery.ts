import { action, makeObservable, observable, runInAction } from 'mobx';

import App from '../../core/App';
import Bonjour from '../../../common/p2p/Bonjour';
import EventEmitter from 'eventemitter3';
import { KeyManagementService } from '../Constants';
import { MultiSigWallet } from '../../wallet/MultiSigWallet';
import PairedDevices from './PairedDevices';
import { Service } from 'react-native-zeroconf';
import { atob } from 'react-native-quick-base64';
import eccrypto from 'eccrypto';
import { getDeviceBasicInfo } from '../../../common/p2p/Utils';
import { handleRawService } from './Common';
import { openShardRedistributionReceiver } from '../../../common/Modals';

class DistributorDiscovery extends EventEmitter<{}> {
  shardsDistributors: Service[] = [];

  constructor() {
    super();

    makeObservable(this, { shardsDistributors: observable });
    Bonjour.on('resolved', this.onResolved);
    Bonjour.on('update', this.onUpdate);
  }

  private onUpdate = () => {
    const all = Object.getOwnPropertyNames(Bonjour.getAllServices() || {});
    runInAction(() => (this.shardsDistributors = this.shardsDistributors.filter((s) => all.find((name) => name === s.name))));
  };

  private onResolved = (raw: Service) => {
    this.handleDistributor(raw);
    this.handleRedistributor(raw);
  };

  private handleDistributor = (raw: Service) => {
    const { shardsDistribution: service } = handleRawService(raw);
    if (!service) return;
    if (this.shardsDistributors.find((s) => s.name === service.name)) return;

    runInAction(() => this.shardsDistributors.push(service));
  };

  private handleRedistributor = async (raw: Service) => {
    const { shardsRedistribution: service } = handleRawService(raw);
    if (!service) return;
    if (!service.txt.witness) return;

    const id = service.txt.distributionId;
    const devices = PairedDevices.devices.filter((d) => d.distributionId === id);
    const device = devices.find((d) => d.deviceInfo.globalId === service.txt.info.globalId);

    if (!device) return;

    const { now, signature } = service.txt.witness as { now: number; signature: string };

    try {
      await eccrypto.verify(
        Buffer.from(device.secretsInfo.verifyPubkey),
        Buffer.from(`${now}_${device.secretsInfo.version}`, 'utf8'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      return;
    }

    openShardRedistributionReceiver({ service });
  };

  scan() {
    Bonjour.scan(KeyManagementService);
  }
}

export default new DistributorDiscovery();

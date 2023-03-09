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
  };

  private handleDistributor = (raw: Service) => {
    const { shardsDistribution, shardsRedistribution } = handleRawService(raw);

    shardsDistribution &&
      !this.shardsDistributors.find((s) => s.name === shardsDistribution.name) &&
      runInAction(() => this.shardsDistributors.push(shardsDistribution));

    shardsRedistribution &&
      !this.shardsDistributors.find((s) => s.name === shardsRedistribution.name) &&
      runInAction(() => this.shardsDistributors.push(shardsRedistribution));
  };

  scan() {
    Bonjour.scan(KeyManagementService);
  }
}

export default new DistributorDiscovery();

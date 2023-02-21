import { action, makeObservable, observable, runInAction } from 'mobx';

import App from '../../core/App';
import Bonjour from '../../../common/p2p/Bonjour';
import EventEmitter from 'eventemitter3';
import { KeyDistributionService } from '../Constants';
import { MultiSigWallet } from '../../wallet/MultiSigWallet';
import { Service } from 'react-native-zeroconf';
import { atob } from 'react-native-quick-base64';
import { getDeviceBasicInfo } from '../../../common/p2p/Utils';

export const LanServices = {
  ShardsDistribution: 'shards-distribution',
  ShardsAggregation: 'shards-aggregation',
};

export function handleRawService(service: Service) {
  try {
    service.txt.info = JSON.parse(atob(service.txt.info));
  } catch (error) {}

  switch (service.txt?.['func']) {
    case LanServices.ShardsDistribution:
      return { shardsDistribution: service };
    case LanServices.ShardsAggregation:
      return { shardsAggregation: service };
  }

  return {};
}

class DistributorDiscovery extends EventEmitter<{}> {
  shardsDistributors: Service[] = [];
  pairedDistributors: Service[] = [];
  pairedServices = new Set<string>();

  constructor() {
    super();

    makeObservable(this, { shardsDistributors: observable, pairedDistributors: observable });
    Bonjour.on('resolved', this.onResolved);
    Bonjour.on('update', this.onUpdate);
  }

  onUpdate = () => {
    const all = Object.getOwnPropertyNames(Bonjour.getAllServices() || {});
    runInAction(() => (this.shardsDistributors = this.shardsDistributors.filter((s) => all.find((name) => name === s.name))));
  };

  onResolved = (raw: Service) => {
    const { shardsDistribution: service } = handleRawService(raw);
    if (!service) return;
    if (this.shardsDistributors.find((s) => s.name === service.name)) return;
    if (this.pairedDistributors.find((s) => s.name === service.name)) return;

    if (this.pairedServices.has(service.name)) {
      runInAction(() => this.pairedDistributors.push(service));
    } else {
      runInAction(() => this.shardsDistributors.push(service));
    }
  };

  scan() {
    const wallets = App.wallets.filter((w) => w.isMultiSig) as MultiSigWallet[];
    this.pairedServices = new Set(wallets.flatMap((w) => w.trustedDevices.map((d) => `sd-${d.globalId}-${w.distributionId}`)));
    Bonjour.scan(KeyDistributionService);
  }

  stop() {
    Bonjour.stopScan();
  }
}

export default new DistributorDiscovery();

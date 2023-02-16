import { action, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from './Bonjour';
import EventEmitter from 'eventemitter3';
import { MultiSignPrimaryServiceType } from '../../viewmodels/tss/Constants';
import { Service } from 'react-native-zeroconf';
import { atob } from 'react-native-quick-base64';

type Events = {
  shardsDistributorFound: (service: Service) => void;
};

export const LanServices = {
  ShardsDistribution: 'shards-distribution',
};

class LanDiscovery extends EventEmitter<Events> {
  shardsDistributors: Service[] = [];

  constructor() {
    super();

    makeObservable(this, { shardsDistributors: observable });
    Bonjour.on('resolved', this.onResolved);
    Bonjour.on('update', this.onUpdate);
  }

  onUpdate = () => {
    const all = Object.getOwnPropertyNames(Bonjour.getAllServices() || {});
    runInAction(() => (this.shardsDistributors = this.shardsDistributors.filter((s) => all.find((name) => name === s.name))));
  };

  onResolved = (service: Service) => {
    try {
      if (this.shardsDistributors.find((d) => d.name === service.name)) return;

      service.txt.info = JSON.parse(atob(service.txt.info));
      runInAction(() => this.shardsDistributors.push(service));

      if (service.txt?.['func'] === LanServices.ShardsDistribution) {
        this.emit('shardsDistributorFound', service);
      }
    } catch (error) {
    } finally {
    }
  };

  scan() {
    Bonjour.scan(MultiSignPrimaryServiceType);
  }

  stop() {
    Bonjour.stopScan();
  }
}

export default new LanDiscovery();

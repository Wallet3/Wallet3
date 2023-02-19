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
  ShardsAggregator: 'shards-aggregator',
};

class LanDiscovery extends EventEmitter<Events> {
  shardsDistributors: Service[] = [];
  shardsAggregators: Service[] = [];

  constructor() {
    super();

    makeObservable(this, { shardsDistributors: observable, shardsAggregators: observable });
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

      switch (service.txt?.['func']) {
        case LanServices.ShardsDistribution:
          this.emit('shardsDistributorFound', service);
          runInAction(() => this.shardsDistributors.push(service));
          break;
      }
    } catch (error) {}
  };

  scan() {
    Bonjour.scan(MultiSignPrimaryServiceType);
  }

  stop() {
    Bonjour.stopScan();
  }
}

export default new LanDiscovery();

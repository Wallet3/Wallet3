import { action, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../common/p2p/Bonjour';
import EventEmitter from 'eventemitter3';
import { MultiSignPrimaryServiceType } from './Constants';
import { Service } from 'react-native-zeroconf';
import { atob } from 'react-native-quick-base64';

type Events = {
  resolved: (service: Service) => void;
};

class LanDiscovery extends EventEmitter<Events> {
  services: Service[] = [];

  constructor() {
    super();

    makeObservable(this, { services: observable });
    Bonjour.on('resolved', this.onResolved);
    Bonjour.on('update', this.onUpdate);
  }

  onUpdate = () => {
    const all = Bonjour.getAllServices();
    const names = Object.getOwnPropertyNames(all);

    runInAction(() => (this.services = this.services.filter((s) => names.find((name) => name === s.name))));
  };

  onResolved = (service: Service) => {
    try {
      if (this.services.find((d) => d.name === service.name)) return;

      service.txt.info = JSON.parse(atob(service.txt.info));
      runInAction(() => this.services.push(service));
    } catch (error) {
    } finally {
      this.emit('resolved', service);
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

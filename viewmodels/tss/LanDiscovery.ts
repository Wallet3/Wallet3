import { action, makeObservable, observable, runInAction } from 'mobx';

import EventEmitter from 'eventemitter3';
import { MultiSignPrimaryServiceType } from './Constants';
import { Service } from 'react-native-zeroconf';
import { TCPClient } from '../../common/p2p/TCPClient';
import ZeroConfiguration from '../../common/p2p/ZeroConfiguration';
import { atob } from 'react-native-quick-base64';

type Events = {
  resolved: (service: Service) => void;
};

class LanDiscovery extends EventEmitter<Events> {
  services: Service[] = [];

  constructor() {
    super();

    makeObservable(this, { services: observable, onUpdate: action, onResolved: action });
    ZeroConfiguration.on('resolved', this.onResolved);
    ZeroConfiguration.on('update', this.onUpdate);
  }

  onUpdate = () => {
    const all = ZeroConfiguration.getAllServices();
    const names = Object.getOwnPropertyNames(all);
    console.log('on update');

    this.services = this.services.filter((s) => names.find((name) => name === s.name));
  };

  onResolved = (service: Service) => {
    try {
      if (this.services.find((d) => d.name === service.name)) return;

      service.txt.info = JSON.parse(atob(service.txt.info));
      this.services.push(service);
    } catch (error) {
    } finally {
      this.emit('resolved', service);
    }
  };

  scan() {
    ZeroConfiguration.scan(MultiSignPrimaryServiceType);
  }

  stop() {
    ZeroConfiguration.stopScan();
  }
}

export default new LanDiscovery();

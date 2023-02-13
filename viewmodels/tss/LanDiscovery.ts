import { makeObservable, observable, runInAction } from 'mobx';

import { MultiSignPrimaryServiceType } from './Constants';
import { Service } from 'react-native-zeroconf';
import { TCPClient } from '../../common/p2p/TCPClient';
import ZeroConfiguration from '../../common/p2p/ZeroConfiguration';
import { atob } from 'react-native-quick-base64';

class LanDiscovery {
  services: Service[] = [];

  constructor() {
    makeObservable(this, { services: observable });
    ZeroConfiguration.on('resolved', this.onResolved);
  }

  private onResolved = (service: Service) => {
    if (this.services.find((d) => d.name === service.name)) return;

    try {
      service.txt.info = JSON.parse(atob(service.txt.info));
      runInAction(() => this.services.push(service));
    } catch (error) {}
  };

  scan() {
    ZeroConfiguration.scan(MultiSignPrimaryServiceType);
  }

  stop() {
    ZeroConfiguration.stopScan();
  }
}

export default new LanDiscovery();

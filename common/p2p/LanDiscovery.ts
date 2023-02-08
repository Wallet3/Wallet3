import Zeroconf, { Service } from 'react-native-zeroconf';

import EventEmitter from 'events';
import { MultiSignPrimaryServiceType } from './Constants';

const zc = new Zeroconf();

class LanDiscovery extends EventEmitter {
  constructor() {
    super();

    zc.on('found', (name) => this.emit('found', name));
    zc.on('resolved', (service) => this.emit('resolved', service));
    zc.on('start', () => console.log('The scan has started.'));
  }

  scan(service: string) {
    zc.scan(service, 'tcp');
  }

  stopScan() {
    zc.stop();
  }

  getService(name: string): Service | undefined {
    return zc.getServices()[name];
  }

  publishService(type: string, name: string, port: number, extra: any) {
    zc.publishService(type, 'tcp', undefined, name, port, extra);
  }
}

export default new LanDiscovery();

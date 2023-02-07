import Zeroconf, { Service } from 'react-native-zeroconf';

import EventEmitter from 'events';
import { MultiSignPrimaryServiceType } from './Constants';

class LanDiscovery extends EventEmitter {
  private zc = new Zeroconf();

  constructor() {
    super();

    this.zc.on('found', (name) => this.emit('found', name));
    this.zc.on('resolved', (service) => this.emit('resolved', service));
    this.zc.on('start', () => console.log('The scan has started.'));
  }

  scan() {
    this.zc.scan(MultiSignPrimaryServiceType, 'tcp');
  }

  stopScan() {
    this.zc.stop();
  }

  getService(name: string): Service | undefined {
    return this.zc.getServices()[name];
  }
}

export default new LanDiscovery();

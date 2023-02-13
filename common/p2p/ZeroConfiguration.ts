import Zeroconf, { Service } from 'react-native-zeroconf';

import EventEmitter from 'eventemitter3';

type Events = {
  found: (name: string) => void;
  resolved: (service: Service) => void;
  start: () => void;
  update: () => void;
};

class ZeroConfiguration extends EventEmitter<Events> {
  zc = new Zeroconf();

  constructor() {
    super();

    this.zc.on('found', (name) => this.emit('found', name));
    this.zc.on('resolved', (service) => this.emit('resolved', service));
    this.zc.on('start', () => console.log('The scan has started.'));
    this.zc.on('update', () => this.emit('update'));
  }

  scan(service: string) {
    this.zc.scan(service, 'tcp');
  }

  stopScan() {
    this.zc.stop();
  }

  getAllServices() {
    return this.zc.getServices() as { [name: string]: { name: string } };
  }

  getService(name: string): Service | undefined {
    return this.zc.getServices()[name];
  }

  publishService(type: string, name: string, port: number, extra: any) {
    this.zc.publishService(type, 'tcp', undefined, name, port, extra);
  }

  unpublishService(name: string) {
    this.zc.unpublishService(name);
  }
}

export default new ZeroConfiguration();

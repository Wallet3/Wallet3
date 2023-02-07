import { AddressInfo, Server, Socket, createServer } from 'net';

import { MultiSignPrimaryServiceType } from './Constants';
import Zeroconf from 'react-native-zeroconf';
import { makeObservable } from 'mobx';

export class TCPServer {
  private zc = new Zeroconf();
  private server: Server;

  constructor() {
    this.server = createServer(this.handleClient);
  }

  get address() {
    return this.server.address() as AddressInfo | null;
  }

  async start() {
    if (this.server.listening) return;
    let port = 39127;

    while (true) {
      try {
        await new Promise<void>((resolve) => this.server.listen({ port, host: '0.0.0.0' }, () => resolve()));
        break;
      } catch (error) {
        port++;
      }
    }

    this.zc.publishService(MultiSignPrimaryServiceType, 'tcp', undefined, 'key-distribution', this.address!.port, {
      role: 'primary',
      func: 'key-distribution',
    });

    return this.address;
  }

  handleClient = (c: Socket) => {};
}

import { action, computed, makeObservable, observable } from 'mobx';

import LanDiscovery from '../../common/p2p/LanDiscovery';
import { MultiSignPrimaryServiceType } from '../../common/p2p/Constants';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';

type Events = {};

export class KeyDistribution extends TCPServer<Events> {
  readonly clients: TCPClient[] = [];

  constructor() {
    super();
    makeObservable(this, { clients: observable, clientCount: computed, rejectClient: action });
  }

  get clientCount() {
    return this.clients.length;
  }

  async start(): Promise<void> {
    await super.start();
    LanDiscovery.publishService(MultiSignPrimaryServiceType, 'key-distribution', this.port!, {
      role: 'primary',
      func: 'key-distribution',
    });
  }

  protected newClient(c: TCPClient): void {
    c.once('close', () => this.rejectClient(c));
  }

  approveClient(client: TCPClient) {}

  rejectClient(client: TCPClient) {
    const index = this.clients.indexOf(client);
    if (index < 0) return;

    this.clients.splice(index, 1);
  }
}

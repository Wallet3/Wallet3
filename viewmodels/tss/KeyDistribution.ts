import { E2EClient, TCPServer } from '../../common/p2p/TCPServer';

import { AsyncTCPSocket } from '../../common/p2p/AsyncTCPSocket';
import LanDiscovery from '../../common/p2p/LanDiscovery';
import { MultiSignPrimaryServiceType } from '../../common/p2p/Constants';

type Events = {
  newClient: (client: AsyncTCPSocket<E2EClient>) => void;
};

export class KeyDistribution extends TCPServer<Events> {

  async start(): Promise<void> {
    await super.start();
    LanDiscovery.publishService(MultiSignPrimaryServiceType, 'key-distribution', this.port!, {
      role: 'primary',
      func: 'key-distribution',
    });
  }

  protected newClient(client: AsyncTCPSocket<E2EClient>): void {
    this.emit('newClient', client);
  }

  approveClient(client: AsyncTCPSocket<E2EClient>) {}

  rejectClient(client: AsyncTCPSocket<E2EClient>) {}

  //   onNewClient(callback: ())
}

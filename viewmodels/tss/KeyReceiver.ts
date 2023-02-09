import { TCPClient } from '../../common/p2p/TCPClient';

export class KeyReceiver extends TCPClient {
  constructor({ host, port }: { host: string; port: number }) {
    super({ service: { host, port } });
    this.once('ready', this.onReady);
  }

  onReady = () => {};
}

import { computed, makeObservable, observable } from 'mobx';
import { createECDH, randomBytes } from 'crypto';
import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import EventEmitter from 'eventemitter3';
import TCP from 'react-native-tcp-socket';

export type E2EClient = {
  random: string;
  devtype: string;
  manufacturer: string;
  name: string;
};

export class TCPServer<T extends EventEmitter.ValidEventTypes> extends EventEmitter<T, any> {
  private readonly server: TCP.Server;
  readonly clients = new Map<AsyncTCPSocket<E2EClient>, string>();

  constructor() {
    super();
    this.server = TCP.createServer(this.handleClient);
    makeObservable(this, { clients: observable, clientCount: computed });
  }

  get port() {
    return this.server.address()?.port;
  }

  get address() {
    return this.server.address()?.address;
  }

  get clientCount() {
    return this.clients.size;
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
  }

  stop() {
    this.server.close();
  }

  private handleClient = async (c: TCP.Socket) => {
    const socket = new AsyncTCPSocket<E2EClient>(c);
    const result = await this.handshake(socket);

    if (result) {
      this.clients.set(socket, result.secret);
      socket.extra = result.info;
      console.log('new client', socket.remoteId, result.info);
    } else {
      socket.destroy();
      return;
    }

    socket.once('close', () => this.clients.delete(socket));
    this.newClient(socket);
  };

  private handshake = async (socket: AsyncTCPSocket<E2EClient>) => {
    const ecdh = createECDH('secp521r1');

    try {
      await socket.write(ecdh.generateKeys());
      const clientEcdhKey = await socket.read();
      if (!clientEcdhKey) return;

      const secret = ecdh.computeSecret(clientEcdhKey).toString('hex');
      const random = randomBytes(16).toString('hex');
      const hello = `server: ${random}`;

      await socket.writeString(encrypt(hello, secret));
      const encrypted = await socket.readString();

      const info: E2EClient = JSON.parse(decrypt(encrypted, secret));
      if (info.random !== random) return;

      return { secret, info };
    } catch (error) {}
  };

  protected newClient(_: AsyncTCPSocket<E2EClient>) {
    throw new Error('Not Implemented');
  }
}

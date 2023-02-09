import { ClientInfo, TCPClient } from './TCPClient';
import { createECDH, randomBytes } from 'crypto';
import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import EventEmitter from 'eventemitter3';
import TCP from 'react-native-tcp-socket';

const { createTLSServer, createServer } = TCP;

export abstract class TCPServer<T extends EventEmitter.ValidEventTypes> extends EventEmitter<T, any> {
  private readonly server: TCP.Server;

  constructor() {
    super();
    this.server = createServer(this.handleClient);
  }

  get port() {
    return this.server.address()?.port;
  }

  get address() {
    return this.server.address()?.address;
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

  private handleClient = async (c: TCP.Socket | TCP.TLSSocket) => {
    const socket = new AsyncTCPSocket(c);
    const result = await this.handshake(socket);

    if (result) {
      console.log('new client', socket.remoteId, result.info);
      this.newClient(new TCPClient({ ...result, socket: c }));
    } else {
      socket.destroy();
      return;
    }
  };

  private handshake = async (socket: AsyncTCPSocket) => {
    const ecdh = createECDH('secp256k1');

    try {
      await socket.write(ecdh.generateKeys());
      const clientEcdhKey = await socket.read();
      if (!clientEcdhKey) return;

      const secret = ecdh.computeSecret(clientEcdhKey).toString('hex');
      const random = randomBytes(16).toString('hex');
      const hello = `server: ${random}`;

      await socket.writeString(encrypt(hello, secret));
      const encrypted = await socket.readString();

      const info: ClientInfo & { hello: string; random: string } = JSON.parse(decrypt(encrypted, secret));
      if (info.random !== random) return;

      await socket.writeString(info.hello);

      return { secret, info };
    } catch (error) {}
  };

  protected abstract newClient(_: TCPClient): void;
}

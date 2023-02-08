import { createECDH, randomBytes } from 'crypto';
import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import { MultiSignPrimaryServiceType } from './Constants';
import TCP from 'react-native-tcp-socket';
import Zeroconf from 'react-native-zeroconf';

export class TCPServer {
  private zc = new Zeroconf();
  private server: TCP.Server;
  private clientKeys = new Map<string, Buffer>();

  constructor() {
    this.server = TCP.createServer(this.handleClient);
  }

  get address() {
    return this.server.address() as { port: number; address: string };
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

    this.zc.publishService(MultiSignPrimaryServiceType, 'tcp', undefined, 'key-distribution', port, {
      role: 'primary',
      func: 'key-distribution',
    });

    return this.address;
  }

  handleClient = async (c: TCP.Socket) => {
    const socket = new AsyncTCPSocket(c);
    const secret = await this.handshake(socket);

    if (secret) {
      console.log('new client', socket.remoteId);
      this.clientKeys.set(socket.remoteId, secret);
    } else {
      socket.destroy();
      return;
    }
  };

  handshake = async (socket: AsyncTCPSocket) => {
    const ecdh = createECDH('secp521r1');

    try {
      await socket.write(ecdh.generateKeys());
      const clientEcdhKey = await socket.read();
      if (!clientEcdhKey) return;

      const secret = ecdh.computeSecret(clientEcdhKey);
      const random = randomBytes(16).toString('hex');
      const hello = `server: ${random}`;

      await socket.writeString(encrypt(hello, secret.toString('hex')));
      const encrypted = await socket.readString();

      if (encrypted) {
        const cr = decrypt(encrypted, secret.toString('hex')).split(':')[1]?.trim();
        if (cr !== random) return;
      }

      return secret;
    } catch (error) {}
  };
}

import { AddressInfo, Server, Socket, createServer } from 'net';
import { createECDH, randomBytes } from 'crypto';
import { decrypt, encrypt } from '../../utils/cipher';

import { MultiSignPrimaryServiceType } from './Constants';
import PromiseSocket from 'promise-socket';
import Zeroconf from 'react-native-zeroconf';

export class TCPServer {
  private zc = new Zeroconf();
  private server: Server;
  private clientKeys = new Map<string, Buffer>();

  constructor() {
    this.server = createServer(this.handleClient);
  }

  get address() {
    return this.server.address() as AddressInfo | null;
  }

  async start() {
    if (this.server.listening) return;
    let port = 39127;

    // while (true) {
    //   try {
    //     await new Promise<void>((resolve) => this.server.listen({ port, host: '0.0.0.0' }, () => resolve()));
    //     break;
    //   } catch (error) {
    //     port++;
    //   }
    // }

    this.zc.publishService(MultiSignPrimaryServiceType, 'tcp', undefined, 'key-distribution', port, {
      role: 'primary',
      func: 'key-distribution',
    });

    return this.address;
  }

  handleClient = async (c: Socket) => {
    console.log('new socket')
    const socket = new PromiseSocket(c);
    const secret = await this.handshake(socket);

    if (secret) {
      this.clientKeys.set(getId(c), secret);
    } else {
      socket.destroy();
      return;
    }
  };

  handshake = async (socket: PromiseSocket<Socket>) => {
    const ecdh = createECDH('secp521r1');
    const serverEcdhKey = ecdh.generateKeys();

    try {
      await socket.write(serverEcdhKey);
      const clientEcdhKey = (await socket.read()) as Buffer;

      if (!clientEcdhKey) return;

      const secret = ecdh.computeSecret(clientEcdhKey);
      const random = randomBytes(8).toString('hex');
      const hello = `server: ${random}`;

      await socket.write(encrypt(hello, secret.toString('hex')));
      const encrypted = (await socket.read()) as string;

      if (encrypted) {
        const cr = decrypt(encrypted, secret.toString('hex')).split(':')[1]?.trim();
        if (cr !== random) return;
      }

      return secret;
    } catch (error) {}
  };
}

function getId(s: Socket) {
  const { address, port } = s.address as unknown as AddressInfo;
  return `${address}:${port}`;
}

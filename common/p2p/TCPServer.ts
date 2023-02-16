import { createCipheriv, createDecipheriv, createECDH, createHash, randomBytes } from 'crypto';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import { CipherAlgorithm } from './Constants';
import EventEmitter from 'eventemitter3';
import TCP from 'react-native-tcp-socket';
import { TCPClient } from './TCPClient';
import { randomInt } from '../../utils/math';
import { sleep } from '../../utils/async';

const { Server } = TCP;

export abstract class TCPServer<T extends EventEmitter.ValidEventTypes> extends EventEmitter<T, any> {
  private readonly server: TCP.Server;
  private static port = randomInt(20000, 50000);
  private handshakingSockets = new Set<AsyncTCPSocket>();

  constructor() {
    TCPServer.port = TCPServer.port > 65532 ? 20000 : TCPServer.port;

    super();
    this.server = new Server(this.handleClient);
  }

  get port() {
    return this.server.address()?.port;
  }

  get address() {
    return this.server.address()?.address;
  }

  async start() {
    if (this.server.listening) return true;
    let attempts = 0;

    while (attempts < 10) {
      try {
        await new Promise<void>((resolve) => this.server.listen({ port: TCPServer.port++, host: '0.0.0.0' }, () => resolve()));
        break;
      } catch (error) {
        console.log(error, TCPServer.port);
        attempts++;
      }
    }

    return attempts < 10;
  }

  stop() {
    this.handshakingSockets.forEach((s) => {
      s.destroy();
      s.removeAllListeners();
    });

    this.handshakingSockets.clear();

    return new Promise<void>((resolve) => {
      this.server.close((err) => {
        console.log('close err:', err);
        resolve();
      });
    });
  }

  private handleClient = async (c: TCP.Socket | TCP.TLSSocket) => {
    const socket = new AsyncTCPSocket(c);
    this.handshakingSockets.add(socket);

    try {
      const client = await this.handshake(socket);

      if (client) {
        while (!client.greeted) {
          await sleep(500);
        }

        console.log('new client', socket.remoteIP, client.greeted);
        this.newClient(client);
      } else {
        socket.destroy();
        return;
      }
    } finally {
      this.handshakingSockets.delete(socket);
    }
  };

  private handshake = async (socket: AsyncTCPSocket): Promise<TCPClient | undefined> => {
    try {
      const iv = randomBytes(16);
      const ecdh = createECDH('secp256k1');

      await socket.write(Buffer.from([...iv, ...ecdh.generateKeys()]));
      const negotiation = (await socket.read())!;

      const civ = negotiation.subarray(0, 16);
      const negotiationKey = negotiation.subarray(16);

      const secret = ecdh.computeSecret(negotiationKey);
      const pairingCode = `${secret.reduce((p, c) => p * BigInt(c || 1), BigInt(1))}`.substring(6, 10);

      const cipher = createCipheriv(CipherAlgorithm, createHash('sha256').update(secret).digest(), iv);
      const decipher = createDecipheriv(CipherAlgorithm, secret, civ);

      return new TCPClient({ cipher, decipher, socket: socket.raw, pairingCode });
    } catch (error) {
      console.error(error);
    }
  };

  protected abstract newClient(_: TCPClient): void;
}

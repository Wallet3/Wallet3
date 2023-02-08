import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import { Service } from 'react-native-zeroconf';
import TCP from 'react-native-tcp-socket';
import { createECDH } from 'crypto';

const { createConnection } = TCP;

export class TCPClient {
  private socket!: AsyncTCPSocket;
  private ecdhKey!: Buffer;

  constructor(args: Service) {
    this.socket = new AsyncTCPSocket(createConnection({ port: args.port, host: args.host }, () => this.handshake()));
  }

  handshake = async () => {
    try {
      const ecdh = createECDH('secp521r1');
      const clientKey = ecdh.generateKeys();

      const serverKey = await this.socket.read();
      await this.socket.write(clientKey);

      const secret = ecdh.computeSecret(serverKey);

      const hello = await this.socket.readString();

      const plain = decrypt(hello, secret.toString('hex'));
      const random = plain.split(':')[1]?.trim();

      await this.socket.writeString(encrypt(`client: ${random}`, secret.toString('hex')));

      this.ecdhKey = secret;
    } catch (e) {}
  };
}

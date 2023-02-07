import { Socket, createConnection } from 'net';
import Zeroconf, { Service } from 'react-native-zeroconf';
import { decrypt, encrypt } from '../../utils/cipher';

import { MultiSignPrimaryServiceType } from './Constants';
import PromiseSocket from 'promise-socket';
import { createECDH } from 'crypto';
import { makeObservable } from 'mobx';

export class TCPClient {
  private socket!: PromiseSocket<Socket>;
  private ecdhKey!: Buffer;

  constructor(args: Service) {
    const raw = createConnection({ port: args.port, host: args.host }, async () => {
      this.socket = new PromiseSocket(raw);
      await this.handshake();
    });
  }

  handshake = async () => {
    const ecdh = createECDH('secp521r1');
    const clientKey = ecdh.generateKeys();

    const serverKey = (await this.socket.read()) as Buffer;
    await this.socket.write(clientKey);

    const ecdhKey = ecdh.computeSecret(serverKey);

    const hello = (await this.socket.read()) as string;
    const plain = decrypt(hello, ecdhKey.toString('hex'));
    const random = plain.split(':')[1]?.trim();

    await this.socket.write(encrypt(`client: ${random}`, ecdhKey.toString('hex')));

    this.ecdhKey = ecdhKey;
  };
}

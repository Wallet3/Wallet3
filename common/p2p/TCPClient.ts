import { createECDH, randomBytes } from 'crypto';
import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import DeviceInfo from 'react-native-device-info';
import { Service } from 'react-native-zeroconf';
import TCP from 'react-native-tcp-socket';

const { createConnection, connectTLS, connect } = TCP;

export type ClientInfo = {
  devtype: string;
  manufacturer: string;
  name: string;
};

export class TCPClient extends AsyncTCPSocket {
  private ecdhKey!: string;
  info?: ClientInfo;

  constructor({
    service,
    socket,
    secret,
    info,
  }: {
    service?: { host: string; port: number };
    socket?: TCP.Socket | TCP.TLSSocket;
    secret?: string;
    info?: ClientInfo;
  }) {
    let internal: TCP.Socket | TCP.TLSSocket = socket!;

    if ((socket && !secret) || (!socket && secret)) {
      throw new Error('Invalid params: socket and secret should be initialized at the same time.');
    }

    if (service) {
      internal = connect({ port: service.port, host: service.host }, () => this.handshake());
      internal.on('error', console.error);
      internal.once('close', console.warn);
    }

    super(internal);
    this.info = info;
    this.ecdhKey = secret!;
  }

  private handshake = async () => {
    try {
      const ecdh = createECDH('secp256k1');
      const clientKey = ecdh.generateKeys();

      const serverKey = await this.read();
      await this.write(clientKey);

      const secret = ecdh.computeSecret(serverKey).toString('hex');

      const serverGreet = await this.readString();

      const plain = decrypt(serverGreet, secret);
      const random = plain.split(':')[1]?.trim();
      const hello = randomBytes(8).toString('hex');

      const info = JSON.stringify({
        random,
        name: DeviceInfo.getDeviceNameSync(),
        devtype: DeviceInfo.getDeviceType(),
        manufacturer: DeviceInfo.getManufacturerSync(),
        hello,
      });

      await this.writeString(encrypt(info, secret));
      if ((await this.readString()) !== hello) {
        super.destroy();
        return;
      }

      this.ecdhKey = secret;
      this.emit('ready');
    } catch (e) {}
  };

  writeStringWithEncryption(plain: string) {
    return this.writeString(encrypt(plain, this.ecdhKey));
  }
}

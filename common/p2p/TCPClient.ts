import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import DeviceInfo from 'react-native-device-info';
import { Service } from 'react-native-zeroconf';
import TCP from 'react-native-tcp-socket';
import { createECDH } from 'crypto';

const { createConnection } = TCP;

export type ClientInfo = {
  random: string;
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
    service?: Service;
    socket?: TCP.Socket | TCP.TLSSocket;
    secret?: string;
    info?: ClientInfo;
  }) {
    let internal: TCP.Socket | TCP.TLSSocket = socket!;

    if ((socket && !secret) || (!socket && secret)) {
      throw new Error('Invalid params: socket and secret should be initialized at the same time.');
    }

    if (service) {
      internal = createConnection({ port: service.port, host: service.host }, () => this.handshake());
    }

    super(internal);
    this.info = info;
    this.ecdhKey = secret!;
  }

  private handshake = async () => {
    try {
      const ecdh = createECDH('secp521r1');
      const clientKey = ecdh.generateKeys();

      const serverKey = await this.read();
      await this.write(clientKey);

      const secret = ecdh.computeSecret(serverKey).toString('hex');

      const hello = await this.readString();

      const plain = decrypt(hello, secret);
      const random = plain.split(':')[1]?.trim();

      const info = JSON.stringify({
        random,
        name: DeviceInfo.getDeviceNameSync(),
        devtype: DeviceInfo.getDeviceType(),
        manufacturer: DeviceInfo.getManufacturerSync(),
      });

      await this.writeString(encrypt(info, secret));

      this.ecdhKey = secret;
    } catch (e) {}
  };
}

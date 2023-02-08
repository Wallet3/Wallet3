import { decrypt, encrypt } from '../../utils/cipher';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import DeviceInfo from 'react-native-device-info';
import { Service } from 'react-native-zeroconf';
import TCP from 'react-native-tcp-socket';
import { createECDH } from 'crypto';

const { createConnection } = TCP;

export class TCPClient {
  private socket!: AsyncTCPSocket;
  private ecdhKey!: string;

  constructor(args: Service) {
    this.socket = new AsyncTCPSocket(createConnection({ port: args.port, host: args.host }, () => this.handshake()));
  }

  private handshake = async () => {
    try {
      const ecdh = createECDH('secp521r1');
      const clientKey = ecdh.generateKeys();

      const serverKey = await this.socket.read();
      await this.socket.write(clientKey);

      const secret = ecdh.computeSecret(serverKey).toString('hex');

      const hello = await this.socket.readString();

      const plain = decrypt(hello, secret);
      const random = plain.split(':')[1]?.trim();

      const info = JSON.stringify({
        random,
        name: DeviceInfo.getDeviceNameSync(),
        devtype: DeviceInfo.getDeviceType(),
        manufacturer: DeviceInfo.getManufacturerSync(),
      });

      await this.socket.writeString(encrypt(info, secret));

      this.ecdhKey = secret;
    } catch (e) {}
  };
}

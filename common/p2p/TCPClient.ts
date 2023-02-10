import { Cipher, Decipher, createCipheriv, createDecipheriv, createECDH, randomBytes } from 'crypto';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import { CipherAlgorithm } from './Constants';
import DeviceInfo from 'react-native-device-info';
import TCP from 'react-native-tcp-socket';

const { connect } = TCP;

export type ClientInfo = {
  devtype: string;
  manufacturer: string;
  name: string;
};

export class TCPClient extends AsyncTCPSocket {
  private cipher!: Cipher;
  private decipher!: Decipher;

  remoteInfo?: ClientInfo;
  verificationCode!: number | string;

  get greeted() {
    return this.remoteInfo ? true : false;
  }

  constructor({
    service,
    socket,
    cipher,
    decipher,
  }: {
    service?: { host: string; port: number };
    socket?: TCP.Socket | TCP.TLSSocket;
    cipher?: Cipher;
    decipher?: Decipher;
  }) {
    let internal: TCP.Socket | TCP.TLSSocket = socket!;

    if (service) {
      internal = connect({ port: service.port, host: service.host }, () => this.handshake());
    }

    super(internal);

    this.cipher = cipher!;
    this.decipher = decipher!;

    if (socket) {
      this.hello();
    }
  }

  private handshake = async () => {
    try {
      const iv = randomBytes(16);
      const ecdh = createECDH('secp256k1');

      const negotiation = await this.read();
      await this.write(Buffer.from([...iv, ...ecdh.generateKeys()]));

      const siv = negotiation.subarray(0, 16);
      const negotiationKey = negotiation.subarray(16);

      const secret = ecdh.computeSecret(negotiationKey);
      this.verificationCode = `${secret.reduce((p, c) => p * BigInt(c), 1n)}`.replaceAll('0', '').substring(6, 12);

      console.log('client computes', secret.toString('hex'), this.verificationCode);

      this.cipher = createCipheriv(CipherAlgorithm, secret, iv);
      this.decipher = createDecipheriv(CipherAlgorithm, secret, siv);

      await this.hello();
      this.emit('ready');
    } catch (e) {
      console.error(e);
    }
  };

  private hello = async () => {
    if (this.greeted) return;

    const selfInfo: ClientInfo = {
      name: DeviceInfo.getDeviceNameSync(),
      devtype: DeviceInfo.getDeviceType(),
      manufacturer: DeviceInfo.getManufacturerSync(),
    };

    this.secureWriteString(JSON.stringify(selfInfo));

    const read = await this.secureReadString();
    this.remoteInfo = JSON.parse(read);
  };

  secureWrite(data: Buffer) {
    return this.write(this.cipher.update(data));
  }

  secureWriteString(plain: string, encoding: BufferEncoding = 'utf8') {
    return this.secureWrite(Buffer.from(plain, encoding));
  }

  async secureRead() {
    const data = await this.read();
    return this.decipher.update(data);
  }

  async secureReadString(encoding: BufferEncoding = 'utf8') {
    const data = await this.secureRead();
    return data.toString(encoding);
  }
}

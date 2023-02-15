import { Cipher, Decipher, createCipheriv, createDecipheriv, createECDH, createHash, randomBytes } from 'crypto';
import { CipherAlgorithm, ClientInfo } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import { AsyncTCPSocket } from './AsyncTCPSocket';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import TCP from 'react-native-tcp-socket';
import { getDeviceInfo } from './Utils';

const { connect } = TCP;

export class TCPClient extends AsyncTCPSocket {
  private cipher!: Cipher;
  private decipher!: Decipher;

  pairingCode: string;
  remoteInfo?: ClientInfo;

  get greeted() {
    return this.remoteInfo ? true : false;
  }

  constructor({
    service,
    socket,
    cipher,
    decipher,
    pairingCode,
  }: {
    service?: { host: string; port: number };
    socket?: TCP.Socket | TCP.TLSSocket;
    cipher?: Cipher;
    decipher?: Decipher;
    pairingCode?: string;
  }) {
    if (service && socket) {
      throw new Error(`'service' and 'socket' should NOT be initialized at the same time.`);
    }

    if (socket && (!cipher || !decipher || !pairingCode)) {
      throw new Error('socket and cipher/decipher/verificationCode should be initialized at the same time.');
    }

    let internal: TCP.Socket | TCP.TLSSocket = socket!;

    if (service) {
      internal = connect({ port: service.port, host: service.host }, () => this.handshake());
    }

    super(internal);

    this.cipher = cipher!;
    this.decipher = decipher!;
    this.pairingCode = pairingCode || '';

    makeObservable(this, { pairingCode: observable });

    if (socket) {
      this.hello();
    }
  }

  private handshake = async () => {
    try {
      const iv = randomBytes(16);
      const ecdh = createECDH('secp256k1');

      const negotiation = await this.read()!;
      await this.write(Buffer.from([...iv, ...ecdh.generateKeys()]));

      const siv = negotiation.subarray(0, 16);
      const negotiationKey = negotiation.subarray(16);

      const secret = ecdh.computeSecret(negotiationKey);
      runInAction(() => (this.pairingCode = `${secret.reduce((p, c) => p * BigInt(c || 1), BigInt(1))}`.substring(6, 10)));

      console.log('client computes', secret.toString('hex'), this.pairingCode);

      this.cipher = createCipheriv(CipherAlgorithm, secret, iv);
      this.decipher = createDecipheriv(CipherAlgorithm, createHash('sha256').update(secret).digest(), siv);

      await this.hello();
      this.emit('ready');
    } catch (e) {
      console.error(e);
    }
  };

  private hello = async () => {
    if (this.greeted) return;

    this.secureWriteString(JSON.stringify(getDeviceInfo()));

    const read = (await this.secureReadString())!;
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
    if (!data) return;
    return this.decipher.update(data);
  }

  async secureReadString(encoding: BufferEncoding = 'utf8') {
    return (await this.secureRead())?.toString(encoding);
  }
}

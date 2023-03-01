import { ContentType, OneTimeKeyExchange, PairingCodeVerified, ShardDistribution, ShardDistributionAck } from './Constants';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { createHash, randomBytes } from 'crypto';

import { TCPClient } from '../../common/p2p/TCPClient';
import eccrypto from 'eccrypto';
import { sha256Sync } from '../../utils/cipher';

export enum ShardTransferringStatus {
  ready = 0,
  sending,
  ackSucceed,
  ackFailed,
}

export class ShardSender {
  private oneTimePubkey!: Buffer;
  readonly socket: TCPClient;
  readonly distributionId: string;

  status = ShardTransferringStatus.ready;

  constructor({ socket, distributionId }: { socket: TCPClient; distributionId: string }) {
    this.socket = socket;
    this.distributionId = distributionId;
    makeObservable(this, { status: observable, closed: computed });
  }

  get closed() {
    return this.socket.closed;
  }

  get remoteInfo() {
    return this.socket.remoteInfo;
  }

  get remoteIP() {
    return this.socket.remoteIP;
  }

  get pairingCode() {
    return this.socket.pairingCode;
  }

  get greeted() {
    return this.socket.greeted;
  }

  async sendPairingCode(code: string) {
    const data: PairingCodeVerified = {
      type: ContentType.pairingCodeVerified,
      hash: sha256Sync(code),
    };

    this.secureWriteString(JSON.stringify(data));

    const keyExchange: OneTimeKeyExchange = JSON.parse((await this.secureReadString())!);
    this.oneTimePubkey = Buffer.from(keyExchange.pubkey, 'hex');
  }

  async sendShard(args: {
    threshold: number;
    rootShard: string;
    verifyPubkey: string;
    verifySignKey: string;
    bip32Shard: string;
    bip32Path: string;
    bip32PathIndex: number;
    bip32Xpubkey: string;
    version: string;
    mainAddress: string;
  }) {
    const { rootShard, bip32Shard, verifySignKey, verifyPubkey, bip32Xpubkey, version } = args;
    runInAction(() => (this.status = ShardTransferringStatus.sending));

    const signKeyBuffer = Buffer.from(verifySignKey, 'hex');

    const rootSignature = (await eccrypto.sign(signKeyBuffer, createHash('sha256').update(rootShard).digest())).toString(
      'hex'
    );

    const bip32Signature = (await eccrypto.sign(signKeyBuffer, createHash('sha256').update(bip32Shard).digest())).toString(
      'hex'
    );

    const [enRootShard, enBip32Shard] = await Promise.all(
      [rootShard, bip32Shard].map(async (secret) => {
        const cipher = await eccrypto.encrypt(this.oneTimePubkey, Buffer.from(secret, 'utf8'));
        return {
          iv: cipher.iv.toString('hex'),
          ciphertext: cipher.ciphertext.toString('hex'),
          ephemPublicKey: cipher.ephemPublicKey.toString('hex'),
          mac: cipher.mac.toString('hex'),
        };
      })
    );

    const data: ShardDistribution = {
      type: ContentType.shardDistribution,
      verifyPubkey,
      distributionId: this.distributionId,
      secrets: {
        rootShard: enRootShard,
        bip32Shard: enBip32Shard,
        rootSignature,
        bip32Signature,
      },
      secretsInfo: {
        bip32Path: args.bip32Path,
        bip32PathIndex: args.bip32PathIndex,
        threshold: args.threshold,
        bip32Xpubkey,
        version,
        mainAddress: args.mainAddress,
      },
    };

    return this.secureWriteString(JSON.stringify(data));
  }

  async readShardAck() {
    const data = (await this.secureReadString())!;

    try {
      const ack = JSON.parse(data) as ShardDistributionAck;

      const success = ack.distributionId === this.distributionId && ack.success;
      runInAction(() => (this.status = success ? ShardTransferringStatus.ackSucceed : ShardTransferringStatus.ackFailed));

      return success;
    } catch (error) {
      runInAction(() => (this.status = ShardTransferringStatus.ackFailed));
    }

    return false;
  }

  secureWriteString(data: string, encoding?: BufferEncoding) {
    return this.socket.secureWriteString(data, encoding);
  }

  secureReadString(encoding?: BufferEncoding) {
    return this.socket.secureReadString(encoding);
  }

  destroy() {
    this.socket.destroy();
  }
}

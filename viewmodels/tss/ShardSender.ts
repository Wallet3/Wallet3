import { ContentType, PairingCodeVerified, ShardDistribution, ShardDistributionAck } from './Constants';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { createHash, randomBytes } from 'crypto';

import { TCPClient } from '../../common/p2p/TCPClient';
import eccrypto from 'eccrypto';
import { randomInt } from '../../utils/math';
import { sha256Sync } from '../../utils/cipher';

export enum ShardTransferringStatus {
  ready = 0,
  sending,
  ackSucceed,
  ackFailed,
}

export class ShardSender {
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

  sendPairingCode(code: string) {
    const data: PairingCodeVerified = {
      r1: randomBytes(randomInt(1, 256)).toString('hex'),
      type: ContentType.pairingCodeVerified,
      hash: sha256Sync(code),
      r2: randomBytes(randomInt(1, 32)).toString('hex'),
    };

    return this.secureWriteString(JSON.stringify(data));
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

    const data: ShardDistribution = {
      r1: randomBytes(randomInt(1, 256)).toString('hex'),
      type: ContentType.shardDistribution,
      verifyPubkey,
      distributionId: this.distributionId,
      secrets: { rootShard: args.rootShard, rootSignature, bip32Shard: args.bip32Shard, bip32Signature },
      secretsInfo: {
        bip32Path: args.bip32Path,
        bip32PathIndex: args.bip32PathIndex,
        threshold: args.threshold,
        bip32Xpubkey,
        version,
        mainAddress: args.mainAddress,
      },
      r2: randomBytes(randomInt(1, 256)).toString('hex'),
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

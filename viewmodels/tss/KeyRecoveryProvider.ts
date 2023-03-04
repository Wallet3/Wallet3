import { ContentType, OneTimeKeyExchange, PairingCodeVerified, RecoveryKeyAck } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import PairedDevices from './management/PairedDevices';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';
import eccrypto from 'eccrypto';
import { getDeviceInfo } from '../../common/p2p/Utils';
import { sha256Sync } from '../../utils/cipher';

interface IConstruction {
  shardKey: ShardKey;
  service: { host: string; port: number };
}

export class KeyRecoveryProvider extends TCPClient {
  private key: ShardKey;
  private oneTimePubkey!: Buffer;

  verified = false;
  distributed = false;

  constructor(args: IConstruction) {
    super(args);

    this.key = args.shardKey;
    makeObservable(this, { verified: observable, distributed: observable });
  }

  send = async (pin?: string) => {
    try {
      const [bip32Secret, rootSecret] = (await Authentication.decryptForever(
        [this.key.secrets.bip32Shard, this.key.secrets.rootShard],
        pin
      )) as string[];

      if (!bip32Secret || !rootSecret) return false;

      const [bip32, root] = await Promise.all(
        [bip32Secret, rootSecret].map(async (secret) => {
          const cipher = await eccrypto.encrypt(this.oneTimePubkey, Buffer.from(secret, 'utf8'));
          return {
            iv: cipher.iv.toString('hex'),
            ciphertext: cipher.ciphertext.toString('hex'),
            ephemPublicKey: cipher.ephemPublicKey.toString('hex'),
            mac: cipher.mac.toString('hex'),
          };
        })
      );

      const data: RecoveryKeyAck = {
        type: ContentType.recoveryKeyAck,
        distributionId: this.key.distributionId,
        bip32,
        root,
        device: getDeviceInfo(),
        secretsInfo: this.key.secretsInfo,
      };

      super.secureWriteString(JSON.stringify(data));

      this.key.lastUsedTimestamp = Date.now();
      this.key.save();

      const id = `${this.remoteInfo!.globalId}-${this.key.distributionId}`;

      if (this.key.id !== id) {
        const newPaired =
          (await ShardKey.findOne({
            where: { ownerDevice: { globalId: this.remoteInfo?.globalId }, distributionId: this.key.distributionId },
          })) ?? new ShardKey();

        newPaired.id = id;
        newPaired.distributionId = this.key.distributionId;
        newPaired.ownerDevice = this.remoteInfo!;
        newPaired.secretsInfo = data.secretsInfo;
        newPaired.createdAt = Date.now();
        newPaired.lastUsedTimestamp = Date.now();
        newPaired.secrets = {
          bip32Shard: await Authentication.encryptForever(bip32Secret),
          rootShard: await Authentication.encryptForever(rootSecret),
        };

        await newPaired.save();
        setImmediate(() => PairedDevices.refresh());
      }

      runInAction(() => (this.distributed = true));
      return true;
    } catch (error) {
      __DEV__ && console.log(error);
    }

    return false;
  };

  verifyPairingCode = async (code: string) => {
    const success = code === this.pairingCode;
    runInAction(() => (this.verified = success));

    if (success) {
      const data: PairingCodeVerified = {
        type: ContentType.pairingCodeVerified,
        hash: sha256Sync(code),
      };

      await this.secureWriteString(JSON.stringify(data));

      const { pubkey } = JSON.parse((await this.secureReadString())!) as OneTimeKeyExchange;
      this.oneTimePubkey = Buffer.from(pubkey, 'hex');
    }

    return success;
  };

  dispose() {
    super.destroy();
  }
}

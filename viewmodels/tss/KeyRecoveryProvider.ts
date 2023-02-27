import { ContentType, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import eccrypto, { Ecies } from 'eccrypto';
import { makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';

interface IConstruction {
  shardKey: ShardKey;
  service: { host: string; port: number };
}

export class KeyRecoveryProvider extends TCPClient {
  private key: ShardKey;
  private req?: ShardAggregationRequest;

  verified = false;

  constructor(args: IConstruction) {
    super(args);

    this.key = args.shardKey;
    makeObservable(this, { verified: observable });

    this.once('ready', this.onReady);
  }

  onReady = async () => {
    try {
      const req: ShardAggregationRequest = JSON.parse((await super.secureReadString())!);

      if (req.type !== ContentType.shardAggregationRequest) {
        super.destroy();
        return;
      }

      if (req.shardVersion !== this.key.secretsInfo.version) {
        super.destroy();
        return;
      }

      this.req = req;
    } catch (error) {}
  };

  send = async (pin?: string) => {
    if (!this.req) return false;

    try {
      const bip32Cipher = this.req.params.bip32Shard ? this.key.secrets.bip32Shard : undefined;
      const rootCipher = this.req.params.rootShard ? this.key.secrets.rootShard : undefined;

      const [bip32Secret, rootSecret] = (await Authentication.decryptForever([bip32Cipher, rootCipher], pin)) as string[];
      if (!bip32Secret && !rootSecret) return false;

      const [bip32Shard, rootShard] = await Promise.all(
        [bip32Secret, rootSecret].map(async (secret) => {
          if (!secret) return undefined;

          const ecies = await eccrypto.encrypt(
            Buffer.from(this.key.secretsInfo.verifyPubkey, 'hex'),
            Buffer.from(secret, 'utf8')
          );

          return {
            iv: ecies.iv.toString('hex'),
            ciphertext: ecies.ciphertext.toString('hex'),
            ephemPublicKey: ecies.ephemPublicKey.toString('hex'),
            mac: ecies.mac.toString('hex'),
          };
        })
      );

      const data: ShardAggregationAck = {
        type: ContentType.shardAggregationAck,
        bip32Shard,
        rootShard,
      };

      super.secureWriteString(JSON.stringify(data));

      this.emit('shardSent' as any);
      this.key.lastUsedTimestamp = Date.now();
      this.key.save();

      return true;
    } catch (error) {}

    return false;
  };

  verifyPairingCode = async (code: string) => {
    const success = code === this.pairingCode;
    runInAction(() => (this.verified = success));
    return success;
  };

  dispose() {
    super.destroy();
  }
}

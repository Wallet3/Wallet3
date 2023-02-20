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

export class ShardProvider extends TCPClient {
  private key: ShardKey;
  private req?: ShardAggregationRequest;

  requestType: null | 'bip32' | 'root' = null;

  constructor(args: IConstruction) {
    super(args);

    this.key = args.shardKey;
    makeObservable(this, { requestType: observable });

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
      runInAction(() => (this.requestType = req.params.bip32Shard ? 'bip32' : 'root'));
    } catch (error) {}
  };

  send = async (pin?: string) => {
    if (!this.req) return false;

    try {
      const cipher = this.req.params.bip32Shard ? this.key.secrets.bip32Shard : this.key.secrets.rootShard;
      const secret = await Authentication.decryptForever(cipher, pin);
      if (!secret) return false;

      const shard = await eccrypto.encrypt(Buffer.from(this.key.secretsInfo.verifyPubkey, 'hex'), Buffer.from(secret, 'hex'));

      const data: ShardAggregationAck = {
        type: ContentType.shardAggregationAck,
        shard: {
          iv: shard.iv.toString('hex'),
          ciphertext: shard.ciphertext.toString('hex'),
          ephemPublicKey: shard.ephemPublicKey.toString('hex'),
          mac: shard.mac.toString('hex'),
        },
      };

      super.secureWriteString(JSON.stringify(data));

      this.emit('shardSent' as any);

      return true;
    } catch (error) {}

    return false;
  };

  dispose() {
    super.destroy();
  }
}

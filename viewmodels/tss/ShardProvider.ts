import { ContentType, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import eccrypto, { Ecies } from 'eccrypto';

import Authentication from '../auth/Authentication';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';

interface IConstruction {
  shardKey: ShardKey;
  service: { host: string; port: number };
}

export class ShardProvider extends TCPClient {
  private key: ShardKey;
  private _req!: ShardAggregationRequest;

  constructor(args: IConstruction) {
    super(args);
    this.key = args.shardKey;
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

      console.log(req);
      this._req = req;
    } catch (error) {}
  };

  send = async (pin?: string) => {
    if (!this._req) return false;

    try {
      const cipher = this._req.params.bip32Shard ? this.key.secrets.bip32Shard : this.key.secrets.rootShard;
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

      return true;
    } catch (error) {}

    return false;
  };

  dispose() {
    super.destroy();
  }
}

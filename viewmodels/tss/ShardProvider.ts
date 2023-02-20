import { ContentType, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import eccrypto, { Ecies } from 'eccrypto';

import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';

interface IConstruction {
  shardKey: ShardKey;
  service: { host: string; port: number };
}

export class ShardProvider extends TCPClient {
  private key: ShardKey;

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

      const shard = await eccrypto.encrypt(
        Buffer.from(this.key.secretsInfo.verifyPubkey, 'hex'),
        Buffer.from(req.params.bip32Shard ? this.key.secrets.bip32Shard : this.key.secrets.rootShard, 'hex')
      );

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
    } catch (error) {}
  };

  dispose() {
    super.destroy();
  }
}

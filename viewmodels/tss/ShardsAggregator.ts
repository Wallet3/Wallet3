import { ContentType, MultiSignPrimaryServiceType, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import eccrypto, { Ecies } from 'eccrypto';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';
import { makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../common/p2p/Bonjour';
import { LanServices } from '../../common/p2p/LanDiscovery';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import secretjs from 'secrets.js-grempe';

interface Conf {
  threshold: number;
  verifyPrivKey?: Buffer;
  aggregatedCallback?: (secret: string) => void;
  aggregationParams: { subPath?: string; subPathIndex?: number; rootShard?: boolean; bip32Shard?: boolean };
}

interface IConstruction extends Conf {
  distributionId: string;
  shardsVersion: string;
}

export class ShardsAggregator extends TCPServer<{}> {
  private conf: Conf;
  private shards: string[] = [];
  readonly id: string;
  readonly version: string;

  clients: TCPClient[] = [];
  readonly device = getDeviceBasicInfo();

  constructor(args: IConstruction) {
    super();
    makeObservable(this, { clients: observable });

    const { distributionId, shardsVersion } = args;

    this.id = distributionId;
    this.version = shardsVersion;
    this.conf = args;
  }

  get name() {
    return `shards-aggregator-${this.id}`;
  }

  get role() {
    return this.conf.verifyPrivKey ? 'primary' : 'standby';
  }

  async start() {
    const succeed = await super.start();

    Bonjour.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: this.role,
      func: LanServices.ShardsAggregator,
      distributionId: this.id,
      info: btoa(JSON.stringify(getDeviceBasicInfo())),
      ver: 1,
    });

    return succeed;
  }

  protected async newClient(c: TCPClient): Promise<void> {
    try {
      runInAction(() => this.clients.push(c));

      const req: ShardAggregationRequest = {
        type: ContentType.shardAggregationRequest,
        params: this.conf.aggregationParams,
        version: this.version,
      };

      await c.secureWriteString(JSON.stringify(req));

      const data: ShardAggregationAck = JSON.parse((await c.secureReadString())!);

      if (this.role === 'primary') {
        const serialized = data.shard as { iv: string; ephemPublicKey: string; ciphertext: string; mac: string };
        const ecies: Ecies = {
          ciphertext: Buffer.from(serialized.ciphertext, 'hex'),
          ephemPublicKey: Buffer.from(serialized.ephemPublicKey, 'hex'),
          iv: Buffer.from(serialized.iv, 'hex'),
          mac: Buffer.from(serialized.mac, 'hex'),
        };

        try {
          const shard = await eccrypto.decrypt(this.conf.verifyPrivKey!, ecies);
          this.shards.push(shard.toString('hex'));
          this.combineShards();
        } catch (error) {}
      }
    } catch (error) {}
  }

  private combineShards() {
    if (this.shards.length < this.conf.threshold) return;

    try {
      const secret = secretjs.combine(this.shards);
      this.conf.aggregatedCallback?.(secret);
    } catch (error) {}
  }

  dispose() {
    this.clients.forEach((c) => c.destroy());
    super.stop();
  }
}

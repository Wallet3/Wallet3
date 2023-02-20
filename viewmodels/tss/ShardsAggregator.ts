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
  initShard: string;
  verifyPrivKey?: Buffer;
  aggregatedCallback?: (secret: string) => void;
  aggregationParams: { subPath?: string; subPathIndex?: number; rootShard?: boolean; bip32Shard?: boolean };
}

interface IConstruction extends Conf {
  distributionId: string;
  shardsVersion: string;
}

interface Events {
  aggregated: (secret: string) => void;
}

export class ShardsAggregator extends TCPServer<Events> {
  private conf: Conf;
  private shards: string[] = [];
  readonly id: string;
  readonly version: string;
  readonly device = getDeviceInfo();

  clients: TCPClient[] = [];
  aggregated = 0;

  constructor(args: IConstruction) {
    super();
    makeObservable(this, { clients: observable, aggregated: observable });

    const { distributionId, shardsVersion } = args;

    this.id = distributionId;
    this.version = shardsVersion;
    this.conf = args;
  }

  get name() {
    return `sa-${this.device.globalId.substring(0, 8)}-${this.id}`;
  }

  get role() {
    return this.conf.verifyPrivKey ? 'primary' : 'standby';
  }

  async start() {
    if (super.listening) return true;
    const succeed = await super.start();
    console.log('aggregator started');

    Bonjour.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: this.role,
      func: LanServices.ShardsAggregation,
      distributionId: this.id,
      info: btoa(JSON.stringify(this.device)),
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
        shardVersion: this.version,
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

        const shard = (await eccrypto.decrypt(this.conf.verifyPrivKey!, ecies)).toString('utf8');
        this.shards.push(shard);
        this.combineShards();
        runInAction(() => (this.aggregated = this.shards.length));
      }
    } catch (error) {}
  }

  private combineShards() {
    if (this.shards.length < this.conf.threshold) return;

    try {
      const secret = secretjs.combine(this.shards);
      this.conf.aggregatedCallback?.(secret);
      this.emit('aggregated', secret);
    } catch (error) {}
  }

  dispose() {
    this.clients.forEach((c) => c.destroy());
    super.stop();
  }
}

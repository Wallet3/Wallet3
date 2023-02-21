import { ContentType, KeyAggregationService, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import eccrypto, { Ecies } from 'eccrypto';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';
import { makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../common/p2p/Bonjour';
import { LanServices } from './management/DistributorDiscovery';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import { randomBytes } from 'crypto';
import secretjs from 'secrets.js-grempe';

interface Conf {
  threshold: number;
  initShard: string;
  autoStart?: boolean;
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
  received = 0;
  aggregated = false;

  constructor(args: IConstruction) {
    super();
    const { distributionId, shardsVersion, initShard } = args;

    initShard && this.shards.push(initShard);
    makeObservable(this, { clients: observable, received: observable, aggregated: observable });

    this.id = distributionId;
    this.version = shardsVersion;
    this.conf = args;

    args.autoStart && this.start();
  }

  get name() {
    return `sa-${this.device.globalId.substring(0, 12)}-${this.id}`;
  }

  get role() {
    return this.conf.verifyPrivKey ? 'primary' : 'standby';
  }

  get threshold() {
    return this.conf.threshold;
  }

  async start() {
    if (super.listening) return true;
    const succeed = await super.start();

    Bonjour.publishService(KeyAggregationService, this.name, this.port!, {
      reqId: randomBytes(8).toString('hex'),
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

        const shard = (await eccrypto.decrypt(this.conf.verifyPrivKey!, ecies)).toString('hex');
        if (this.shards.includes(shard)) return;

        this.shards.push(shard);
        this.combineShards();
        runInAction(() => (this.received = this.shards.length));
      }
    } catch (error) {}
  }

  private combineShards() {
    if (this.shards.length < this.threshold) return;

    try {
      const secret = secretjs.combine(this.shards);
      this.conf.aggregatedCallback?.(secret);
      this.emit('aggregated', secret);
      runInAction(() => (this.aggregated = true));
    } catch (error) {
      console.error('aggregated error:', error);
    }
  }

  dispose() {
    Bonjour.unpublishService(this.name);
    this.clients.forEach((c) => c.destroy());
    super.stop();
  }
}

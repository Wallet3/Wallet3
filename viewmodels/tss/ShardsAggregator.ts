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
import { utils } from 'ethers';

interface Conf {
  threshold: number;
  initRootShard?: string;
  initBip32Shard?: string;
  autoStart?: boolean;
  verifyPrivKey?: Buffer;
  aggregatedCallback?: (args: { rootSecret?: string; bip32Secret?: string }) => void;
  aggregationParams: { subPath?: string; subPathIndex?: number; rootShard?: boolean; bip32Shard?: boolean };
}

interface IConstruction extends Conf {
  distributionId: string;
  shardsVersion: string;
}

interface Events {
  aggregated: (args: { rootSecret?: string; bip32Secret?: string }) => void;
}

export class ShardsAggregator extends TCPServer<Events> {
  private conf: Conf;
  private rootShards = new Set<string>();
  private bip32Shards = new Set<string>();
  readonly id: string;
  readonly version: string;
  readonly device = getDeviceInfo();

  clients: TCPClient[] = [];
  received = 0;
  aggregated = false;

  constructor(args: IConstruction) {
    super();
    const { distributionId, shardsVersion, initRootShard, initBip32Shard } = args;

    initRootShard && this.rootShards.add(initRootShard);
    initBip32Shard && this.bip32Shards.add(initBip32Shard);

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

  get rootShares() {
    return this.aggregated ? Array.from(this.rootShards) : undefined;
  }

  get bip32Shares() {
    return this.aggregated ? Array.from(this.bip32Shards) : undefined;
  }

  get rootEntropy() {
    return this.aggregated ? secretjs.combine(this.rootShares!) : undefined;
  }

  get bip32XprivKey() {
    return this.aggregated ? Buffer.from(secretjs.combine(this.bip32Shares!), 'hex').toString('utf8') : undefined;
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
    if (this.aggregated) {
      c.destroy();
      return;
    }

    runInAction(() => this.clients.push(c));

    try {
      const req: ShardAggregationRequest = {
        type: ContentType.shardAggregationRequest,
        params: this.conf.aggregationParams,
        shardVersion: this.version,
      };

      await c.secureWriteString(JSON.stringify(req));
      const data: ShardAggregationAck = JSON.parse((await c.secureReadString())!);

      if (this.role === 'primary') {
        const [rootShard, bip32Shard] = await Promise.all(
          [data.rootShard, data.bip32Shard].map(async (serialized) => {
            if (!serialized) return undefined;

            const ecies: Ecies = {
              ciphertext: Buffer.from(serialized.ciphertext, 'hex'),
              ephemPublicKey: Buffer.from(serialized.ephemPublicKey, 'hex'),
              iv: Buffer.from(serialized.iv, 'hex'),
              mac: Buffer.from(serialized.mac, 'hex'),
            };

            return (await eccrypto.decrypt(this.conf.verifyPrivKey!, ecies)).toString('utf8');
          })
        );

        rootShard && this.rootShards.add(rootShard);
        bip32Shard && this.bip32Shards.add(bip32Shard);

        runInAction(() => (this.received = this.rootShards.size || this.bip32Shards.size));
        this.combineShards();
      }
    } catch (error) {}
  }

  private combineShards() {
    if (this.aggregated) return;
    if (this.rootShards.size < this.threshold && this.bip32Shards.size < this.threshold) {
      return;
    }

    try {
      const [rootSecret, bip32Secret] = [this.rootShards, this.bip32Shards].map((shards) =>
        shards.size >= this.threshold ? secretjs.combine(Array.from(shards)) : undefined
      );

      rootSecret && utils.entropyToMnemonic(Buffer.from(rootSecret, 'hex'));

      const xprv = bip32Secret && Buffer.from(bip32Secret, 'hex').toString('utf8')!;
      if (xprv && !xprv.startsWith('xprv')) {
        throw new Error('Invalid hd private key');
      }

      this.conf.aggregatedCallback?.({ rootSecret, bip32Secret: xprv });
      this.emit('aggregated', { rootSecret, bip32Secret: xprv });

      runInAction(() => (this.aggregated = true));
      Bonjour.unpublishService(this.name);
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

import { ContentType, MultiSignPrimaryServiceType, ShardAcknowledgement, ShardDistribution } from './Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { atob, btoa } from 'react-native-quick-base64';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import { DEFAULT_DERIVATION_PATH } from '../../common/Constants';
import { HDNode } from 'ethers/lib/utils';
import LINQ from 'linq';
import { ShardSender } from './ShardSender';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import ZeroConfiguration from '../../common/p2p/ZeroConfiguration';
import { createHash } from 'crypto';
import secretjs from 'secrets.js-grempe';
import { utils } from 'ethers';

type Events = {
  newClient: (client: ShardSender) => void;
};

interface IConstruction {
  mnemonic: string;
}

export enum ShardsDistributionStatus {
  notDistributed = 0,
  distributing,
  distributionSucceed,
  distributionFailed,
}

export class ShardsDistributor extends TCPServer<Events> {
  private rootEntropy: string;
  private root: HDNode;
  private protector: HDNode;
  private bip32: HDNode;

  readonly id: string;
  approvedClients: ShardSender[] = [];
  pendingClients: ShardSender[] = [];

  localShardStatus = ShardsDistributionStatus.notDistributed;
  status = ShardsDistributionStatus.notDistributed;
  threshold = 2;

  constructor({ mnemonic }: IConstruction) {
    super();

    makeObservable(this, {
      approvedClients: observable,
      pendingClients: observable,
      status: observable,
      localShardStatus: observable,
      threshold: observable,
      thresholdTooHigh: computed,
      approvedCount: computed,
      pendingCount: computed,
      totalCount: computed,

      approveClient: action,
      rejectClient: action,
      setThreshold: action,
    });

    this.rootEntropy = utils.mnemonicToEntropy(mnemonic).substring(2);

    const start = performance.now();
    this.root = utils.HDNode.fromMnemonic(mnemonic);
    this.protector = this.root.derivePath(`m/0'/3`);
    this.bip32 = this.root.derivePath(DEFAULT_DERIVATION_PATH);
    console.info(`Shards generation: ${performance.now() - start}`);

    this.id = createHash('sha256').update(this.protector.address).digest().toString('hex').substring(2, 34);
  }

  get name() {
    return `shards-distributor-${this.id}`;
  }

  get totalCount() {
    return this.approvedCount + 1;
  }

  get approvedCount() {
    return this.approvedClients.length;
  }

  get pendingCount() {
    return this.pendingClients.length;
  }

  get thresholdTooHigh() {
    return this.threshold / this.approvedCount > 0.9999;
  }

  async start() {
    const result = await super.start();
    if (!result) return false;

    console.log('publish service');

    ZeroConfiguration.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: 'primary',
      func: 'shards-distribution',
      distributionId: this.id,
      info: btoa(JSON.stringify(getDeviceBasicInfo())),
      ver: 1,
    });

    return true;
  }

  protected newClient(c: TCPClient): void {
    const s = new ShardSender({ socket: c, distributionId: this.id });
    runInAction(() => this.pendingClients.push(s));
    c.once('close', () => this.rejectClient(s));
  }

  approveClient(client: ShardSender, code: string) {
    if (client.closed) return;

    client.sendPairingCode(code);
    this.approvedClients.push(client);

    const index = this.pendingClients.indexOf(client);
    if (index >= 0) this.pendingClients.splice(index, 1);
  }

  rejectClient(client: ShardSender) {
    let index = this.approvedClients.indexOf(client);
    if (index >= 0) this.approvedClients.splice(index, 1);

    index = this.pendingClients.indexOf(client);
    if (index >= 0) this.pendingClients.splice(index, 1);

    if (!client.closed) client.destroy();
  }

  setThreshold(threshold: number) {
    this.threshold = Math.max(threshold, 2);
  }

  async distributeSecret() {
    console.log('client count', this.approvedCount);

    if (this.status === ShardsDistributionStatus.distributing || this.status === ShardsDistributionStatus.distributionSucceed)
      return;
    if (this.totalCount < this.threshold) return;

    runInAction(() => (this.status = ShardsDistributionStatus.distributing));

    const rootShards = secretjs.share(this.rootEntropy, this.totalCount, this.threshold);
    console.log(this.bip32.extendedKey, this.bip32.privateKey);
    const bip32Shards = secretjs.share(this.bip32.privateKey.substring(2), this.totalCount, this.threshold);

    rootShards[0];
    bip32Shards[0];

    const result = await Promise.all(
      rootShards.slice(1).map(async (rootShard, index) => {
        const c = this.approvedClients[index];
        if (!c) return false;

        c.sendShard({
          rootShard,
          bip32Shard: bip32Shards[index],
          pubkey: this.protector.publicKey.substring(2),
          signKey: this.protector.privateKey.substring(2),
        });
        return await c.readShardAck();
      })
    );

    const succeed = LINQ.from(result).sum((r) => (r ? 1 : 0)) + 1 >= this.threshold;
    console.log('distribution succeed:', succeed);

    runInAction(
      () =>
        (this.status = succeed ? ShardsDistributionStatus.distributionSucceed : ShardsDistributionStatus.distributionFailed)
    );
  }

  dispose() {
    super.stop();

    ZeroConfiguration.unpublishService(this.name);
    this.approvedClients.forEach((c) => c.destroy());
    this.pendingClients.forEach((c) => c.destroy());
  }
}

import { ContentType, ShardAcknowledgement, ShardDistribution } from './network/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { HDNode } from 'ethers/lib/utils';
import LINQ from 'linq';
import LanDiscovery from '../../common/p2p/LanDiscovery';
import { MultiSignPrimaryServiceType } from '../../common/p2p/Constants';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { createHash } from 'crypto';
import secretjs from 'secrets.js-grempe';
import { utils } from 'ethers';

type Events = {
  newClient: (client: TCPClient) => void;
};

interface IConstruction {
  mnemonic: string;
}

enum DistributionStatus {
  notDistributed,
  distributing,
  distributionSucceed,
  distributionFailed,
}

export class KeyDistribution extends TCPServer<Events> {
  private rootEntropy: string;
  private root: HDNode;
  private protector: HDNode;

  readonly id: string;
  approvedClients: TCPClient[] = [];
  pendingClients: TCPClient[] = [];
  distributedClients = new Set<TCPClient>();
  status = DistributionStatus.notDistributed;

  constructor({ mnemonic }: IConstruction) {
    super();

    makeObservable(this, {
      approvedClients: observable,
      pendingClients: observable,
      distributedClients: observable,
      status: observable,
      approvedCount: computed,

      approveClient: action,
      rejectClient: action,
    });

    this.rootEntropy = utils.mnemonicToEntropy(mnemonic).substring(2);

    this.root = utils.HDNode.fromMnemonic(mnemonic);
    this.protector = this.root.derivePath(`m/0'/3`);

    this.id = createHash('sha256').update(this.protector.address).digest().toString('hex').substring(2, 34);
  }

  get name() {
    return `key-distribution-${this.id}`;
  }

  get approvedCount() {
    return this.approvedClients.length;
  }

  get pendingCount() {
    return this.pendingClients.length;
  }

  async start() {
    const result = await super.start();
    if (!result) return false;

    LanDiscovery.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: 'primary',
      func: 'key-distribution',
      distributionId: this.id,
    });

    return true;
  }

  protected newClient(c: TCPClient): void {
    this.emit('newClient', c);
    runInAction(() => this.pendingClients.push(c));
    c.once('close', () => this.rejectClient(c));
  }

  approveClient(client: TCPClient) {
    this.approvedClients.push(client);
  }

  rejectClient(client: TCPClient) {
    this.distributedClients.delete(client);

    let index = this.approvedClients.indexOf(client);
    if (index >= 0) this.approvedClients.splice(index, 1);

    index = this.pendingClients.indexOf(client);
    if (index >= 0) this.pendingClients.splice(index, 1);
  }

  async distributeSecret(threshold: number) {
    console.log('client count', this.approvedCount);

    if (this.status === DistributionStatus.distributing || this.status === DistributionStatus.distributionSucceed) return;
    if (this.approvedCount === 0) return;

    runInAction(() => (this.status = DistributionStatus.distributing));

    threshold = Math.max(2, Math.min(this.approvedCount + 1, threshold));
    const shards = secretjs.share(this.rootEntropy, this.approvedCount + 1, threshold);
    shards[0];

    await Promise.all(
      shards.slice(1).map((shard, index) =>
        this.approvedClients[index].secureWriteString(
          JSON.stringify({
            type: ContentType.shardDistribution,
            shard,
            pubkey: this.protector.publicKey.substring(2),
            distributionId: this.id,
          } as ShardDistribution)
        )
      )
    );

    const result = await Promise.all(
      this.approvedClients.map(async (c) => {
        const data = await c.secureReadString();
        console.log('server received:', data);
        const ack = JSON.parse(data) as ShardAcknowledgement;
        if (ack.distributionId !== this.id || !ack.success || ack.type !== ContentType.shardAcknowledgement) return false;

        runInAction(() => this.distributedClients.add(c));
        return true;
      })
    );

    const succeed = LINQ.from(result).sum((r) => (r ? 1 : 0)) + 1 >= threshold;
    console.log('distribution succeed:', succeed);

    runInAction(
      () => (this.status = succeed ? DistributionStatus.distributionSucceed : DistributionStatus.distributionFailed)
    );
  }

  stop(): void {
    super.stop();
    LanDiscovery.unpublishService(this.name);
  }
}

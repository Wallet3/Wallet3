import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import Bonjour from '../../common/p2p/Bonjour';
import { DEFAULT_DERIVATION_PATH } from '../../common/Constants';
import { HDNode } from 'ethers/lib/utils';
import LINQ from 'linq';
import { LanServices } from '../../common/p2p/LanDiscovery';
import MessageKeys from '../../common/MessageKeys';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { MultiSignPrimaryServiceType } from './Constants';
import { ShardSender } from './ShardSender';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import { createHash } from 'crypto';
import { getDeviceBasicInfo } from '../../common/p2p/Utils';
import i18n from '../../i18n';
import secretjs from 'secrets.js-grempe';
import { showMessage } from 'react-native-flash-message';
import { utils } from 'ethers';
import { xpubkeyFromHDNode } from '../../utils/bip32';

type Events = {
  newClient: (client: ShardSender) => void;
};

export interface IShardsDistributorConstruction {
  mnemonic: string;
  basePath?: string;
  basePathIndex?: number;
}

export enum ShardsDistributionStatus {
  ready = 0,
  distributing,
  succeed,
  failed,
}

export class ShardsDistributor extends TCPServer<Events> {
  private rootEntropy: string;
  private root: HDNode;
  private protector: HDNode;
  private bip32: HDNode;
  private serviceStarted = false;

  readonly id: string;
  approvedClients: ShardSender[] = [];
  pendingClients: ShardSender[] = [];

  localShardStatus = ShardsDistributionStatus.ready;
  status = ShardsDistributionStatus.ready;
  threshold = 2;

  constructor({ mnemonic, basePath }: IShardsDistributorConstruction) {
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
    this.bip32 = this.root.derivePath(basePath ?? DEFAULT_DERIVATION_PATH);
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
    return this.threshold / this.totalCount > 0.9999;
  }

  async start() {
    const result = await super.start();
    if (!result) return false;
    if (this.serviceStarted) return true;

    console.log('publish service');

    Bonjour.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: 'primary',
      func: LanServices.ShardsDistribution,
      distributionId: this.id,
      info: btoa(JSON.stringify(getDeviceBasicInfo())),
      ver: 1,
    });

    this.serviceStarted = true;
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
    if (this.status === ShardsDistributionStatus.distributing || this.status === ShardsDistributionStatus.succeed) return;

    if (this.totalCount < this.threshold) {
      showMessage({ message: i18n.t('multi-sig-modal-msg-network-lost'), type: 'warning' });
      return;
    }

    runInAction(() => (this.localShardStatus = this.status = ShardsDistributionStatus.distributing));

    const rootShards = secretjs.share(this.rootEntropy, this.totalCount, this.threshold);
    const bip32Shards = secretjs.share(this.bip32.privateKey.substring(2), this.totalCount, this.threshold);

    const key = new MultiSigKey();
    key.id = this.id;
    key.secretsInfo = { threshold: this.threshold, devices: this.approvedClients.map((a) => a.remoteInfo!) };
    key.bip32Xpubkey = xpubkeyFromHDNode(this.bip32);
    key.secrets = {
      bip32Shard: await Authentication.encryptForever(bip32Shards[0]),
      rootShard: await Authentication.encryptForever(rootShards[0]),
    };

    try {
      await key.save();
      runInAction(() => (this.localShardStatus = ShardsDistributionStatus.succeed));
    } catch (error) {
      runInAction(() => (this.localShardStatus = this.status = ShardsDistributionStatus.failed));
      showMessage({ message: i18n.t('msg-database-error'), type: 'danger' });
      return;
    }

    const result = await Promise.all(
      rootShards.slice(1).map(async (rootShard, index) => {
        const c = this.approvedClients[index];
        if (!c) return 0;

        c.sendShard({
          rootShard,
          bip32Shard: bip32Shards[index],
          pubkey: this.protector.publicKey.substring(2),
          signKey: this.protector.privateKey.substring(2),
          threshold: this.threshold,
        });

        return (await c.readShardAck()) ? 1 : 0;
      })
    );

    const succeed = LINQ.from(result).sum() + 1 >= this.threshold;

    if (succeed) {
      PubSub.publish(MessageKeys.multiSigWalletCreated, key);
    } else {
      await key.remove();
    }

    runInAction(() => (this.status = succeed ? ShardsDistributionStatus.succeed : ShardsDistributionStatus.failed));
  }

  dispose() {
    this.serviceStarted = false;
    super.stop();

    Bonjour.unpublishService(this.name);
    this.approvedClients.forEach((c) => c.destroy());
    this.pendingClients.forEach((c) => c.destroy());
  }
}

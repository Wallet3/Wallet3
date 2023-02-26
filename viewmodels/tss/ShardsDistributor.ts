import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { createHash, randomBytes } from 'crypto';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import Authentication from '../auth/Authentication';
import Bonjour from '../../common/p2p/Bonjour';
import { DEFAULT_DERIVATION_PATH } from '../../common/Constants';
import { HDNode } from 'ethers/lib/utils';
import { KeyDistributionService } from './Constants';
import LINQ from 'linq';
import { LanServices } from './management/DistributorDiscovery';
import MessageKeys from '../../common/MessageKeys';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { ShardSender } from './ShardSender';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import i18n from '../../i18n';
import secretjs from 'secrets.js-grempe';
import { sha256Sync } from '../../utils/cipher';
import { showMessage } from 'react-native-flash-message';
import { utils } from 'ethers';
import { xpubkeyFromHDNode } from '../../utils/bip32';

type Events = {
  newClient: (client: ShardSender) => void;
  secretDistributed: () => void;
};

export interface IShardsDistributorConstruction {
  mnemonic: string;
  basePath?: string;
  basePathIndex?: number;
  autoStart?: boolean;
}

export enum ShardsDistributionStatus {
  ready = 0,
  distributing,
  succeed,
  failed,
}

export class ShardsDistributor extends TCPServer<Events> {
  protected rootEntropy: string;
  protected root: HDNode;
  protected protector: HDNode;
  protected bip32: HDNode;
  protected serviceStarted = false;
  protected upgradeInfo?: { basePath: string; basePathIndex: number };

  readonly id: string;
  readonly device = getDeviceInfo();
  approvedClients: ShardSender[] = [];
  pendingClients: ShardSender[] = [];

  localShardStatus = ShardsDistributionStatus.ready;
  status = ShardsDistributionStatus.ready;
  threshold = 2;

  constructor({ mnemonic, basePath, basePathIndex, autoStart }: IShardsDistributorConstruction) {
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
      clientsOK: computed,

      approveClient: action,
      rejectClient: action,
      setThreshold: action,
    });

    this.rootEntropy = utils.mnemonicToEntropy(mnemonic).substring(2);

    this.root = utils.HDNode.fromMnemonic(mnemonic);
    this.protector = this.root.derivePath(`m/0'/3`);
    this.bip32 = this.root.derivePath(basePath ?? DEFAULT_DERIVATION_PATH);

    this.id = sha256Sync(this.protector.address).substring(0, 32);

    if (basePath && basePathIndex !== undefined) {
      this.upgradeInfo = { basePath, basePathIndex };
    }

    autoStart && this.start();
  }

  get name() {
    return `sd-${this.device.globalId.substring(0, 12)}-${this.id}`;
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

  get clientsOK() {
    return this.totalCount >= this.threshold && this.approvedCount >= 1;
  }

  async start() {
    const result = await super.start();
    if (!result) return false;
    if (this.serviceStarted) return true;

    Bonjour.publishService(KeyDistributionService, this.name, this.port!, {
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

    if (!this.clientsOK) {
      showMessage({ message: i18n.t('multi-sig-modal-msg-network-lost'), type: 'warning' });
      return;
    }

    runInAction(() => (this.localShardStatus = this.status = ShardsDistributionStatus.distributing));

    const rootShards: string[] = secretjs.share(this.rootEntropy, this.totalCount, this.threshold);
    const bip32XprivKey = Buffer.from(this.bip32.extendedKey, 'utf8').toString('hex');
    const bip32Shards: string[] = secretjs.share(bip32XprivKey, this.totalCount, this.threshold);

    const key = (await MultiSigKey.findOne({ where: { id: this.id } })) ?? new MultiSigKey();
    key.id = this.id;
    key.bip32Xpubkey = xpubkeyFromHDNode(this.bip32);
    key.basePath = this.upgradeInfo?.basePath ?? DEFAULT_DERIVATION_PATH;
    key.basePathIndex = this.upgradeInfo?.basePathIndex ?? 0;

    key.secretsInfo = {
      threshold: this.threshold,
      version: randomBytes(8).toString('hex'),
      distributedCount: this.totalCount,
      devices: this.approvedClients.map((a) => {
        return { ...a.remoteInfo!, distributedAt: Date.now(), lastUsedAt: Date.now() };
      }),
    };

    key.secrets = {
      bip32Shard: await Authentication.encrypt(bip32Shards.shift()!),
      rootShard: await Authentication.encrypt(rootShards.shift()!),
      verifySignKey: await Authentication.encrypt(this.protector.privateKey.substring(2)),
    };

    try {
      await key.save();
      runInAction(() => (this.localShardStatus = ShardsDistributionStatus.succeed));
    } catch (error) {
      runInAction(() => (this.localShardStatus = this.status = ShardsDistributionStatus.failed));
      showMessage({ message: i18n.t('msg-database-error'), type: 'danger' });
      return;
    }

    const zip = rootShards.map((v1, i) => [v1, bip32Shards[i]]);

    const result = await Promise.all(
      zip.map(async (shards, index) => {
        const c = this.approvedClients[index];
        if (!c) return 0;

        const [rootShard, bip32Shard] = shards;

        try {
          c.sendShard({
            rootShard,
            bip32Shard,
            verifyPubkey: this.protector.publicKey.substring(2),
            verifySignKey: this.protector.privateKey.substring(2),
            threshold: this.threshold,
            bip32Path: key.basePath,
            bip32PathIndex: key.basePathIndex,
            bip32Xpubkey: key.bip32Xpubkey,
            version: key.secretsInfo.version,
          });

          return (await c.readShardAck()) ? 1 : 0;
        } catch (error) {
          return 0;
        }
      })
    );

    const succeed = LINQ.from(result).sum() + 1 >= this.threshold;

    runInAction(() => (this.status = succeed ? ShardsDistributionStatus.succeed : ShardsDistributionStatus.failed));

    if (succeed) {
      super.emit('secretDistributed');
      return key;
    } else {
      await key.remove();
    }
  }

  dispose() {
    this.serviceStarted = false;
    super.stop();

    Bonjour.unpublishService(this.name);
    this.approvedClients.forEach((c) => c.destroy());
    this.pendingClients.forEach((c) => c.destroy());
  }
}

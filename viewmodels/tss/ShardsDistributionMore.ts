import { IShardsDistributorConstruction, ShardsDistributionStatus, ShardsDistributor } from './ShardsDistributor';
import { computed, makeObservable, runInAction } from 'mobx';
import secretjs, { share } from 'secrets.js-grempe';

import LINQ from 'linq';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { ShardSender } from './ShardSender';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';
import { utils } from 'ethers';

interface IConstruction {
  rootEntropy: Buffer;
  rootShares: string[];
  bip32Shares: string[];
  key: MultiSigKey;
  autoStart?: boolean;
}

export class ShardsDistributionMore extends ShardsDistributor {
  private key: MultiSigKey;
  private rootShares: string[];
  private bip32Shares: string[];

  constructor({ rootShares, bip32Shares, key, rootEntropy, autoStart }: IConstruction) {
    super({
      mnemonic: utils.entropyToMnemonic(rootEntropy),
      basePath: key.basePath,
      basePathIndex: key.basePathIndex,
      autoStart,
    });

    this.key = key;
    this.rootShares = rootShares;
    this.bip32Shares = bip32Shares;

    // makeObservable(this, { clientsOK: computed });
  }

  get clientsOK(): boolean {
    return this.approvedCount >= 1;
  }

  setThreshold(_: number): void {
    throw new Error(`Can't set threshold`);
  }

  approveClient(client: ShardSender, code: string): void {
    if (this.key.secretsInfo.devices.find((d) => d.globalId === client.remoteInfo?.globalId)) return;
    super.approveClient(client, code);
  }

  async distributeSecret(): Promise<MultiSigKey | undefined> {
    if (!this.clientsOK) {
      showMessage({ message: i18n.t('multi-sig-modal-msg-network-lost'), type: 'warning' });
      return;
    }

    runInAction(() => (this.status = this.status = ShardsDistributionStatus.distributing));

    const result = await Promise.all(
      this.approvedClients.map(async (c) => {
        const index = this.key.secretsInfo.distributedCount++;

        const [rootShard, bip32Shard] = [this.rootShares, this.bip32Shares].map((shares) => secretjs.newShare(index, shares));

        c.sendShard({
          rootShard,
          bip32Shard,
          verifyPubkey: this.protector.publicKey.substring(2),
          verifySignKey: this.protector.privateKey.substring(2),
          threshold: this.threshold,
          bip32Path: this.key.basePath,
          bip32PathIndex: this.key.basePathIndex,
          bip32Xpubkey: this.key.bip32Xpubkey,
          version: this.key.secretsInfo.version,
        });

        (await c.readShardAck()) ? 1 : 0;
      })
    );

    const succeed = LINQ.from(result).sum() > 0;
    runInAction(() => (this.status = succeed ? ShardsDistributionStatus.succeed : ShardsDistributionStatus.failed));

    await this.key.save();
    return this.key;
  }
}

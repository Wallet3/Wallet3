import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

import { ClientInfo } from '../../common/p2p/Constants';

export interface MultiKeyDeviceInfo extends ClientInfo {
  distributedAt: number;
}

@Entity({ name: 'multiSig_keys' })
export default class MultiSigKey extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  get distributionId() {
    return this.id;
  }

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'simple-json', nullable: false })
  secrets!: { rootShard: string; bip32Shard: string };

  @Column({ type: 'simple-json', nullable: false })
  secretsInfo!: { threshold: number; devices: MultiKeyDeviceInfo[] };

  @Column({ type: 'simple-json', nullable: true })
  cachedSecrets?: { rootShards: string[]; bip32Shards: string[] };

  @Column({ type: 'text', default: '' })
  bip32Xpubkey!: string;

  @Column({ default: `m/44''/60''/0''/0`, type: 'text' })
  basePath!: string;

  @Column({ default: 0 })
  basePathIndex!: number;

  @Column({ default: Date.now() })
  lastUsedTimestamp!: number;
}

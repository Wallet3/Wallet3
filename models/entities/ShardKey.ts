import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

import { ClientInfo } from '../../common/p2p/Constants';

@Entity({ name: 'primary_shards' })
export default class ShardKey extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column()
  distributionId!: string;

  @Column({ type: 'simple-json' })
  ownerDevice!: ClientInfo;

  @Column({ type: 'simple-json', nullable: false })
  secrets!: { rootShard: string; bip32Shard: string };

  @Column({ type: 'simple-json', nullable: false })
  secretsInfo!: {
    threshold: number;
    bip32Path: string;
    bip32PathIndex: number;
    bip32Xpubkey: string;
    version: string;
    verifyPubkey: string;
  };

  @Column()
  lastUsedTimestamp!: number;

  @Column()
  createdAt!: number;
}

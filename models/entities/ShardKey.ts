import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { ClientInfo } from '../../common/p2p/Constants';

@Entity({ name: 'shards' })
export default class ShardKey extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  get distributionId() {
    return this.id;
  }

  @Column({ type: 'simple-json' })
  ownerDevice!: ClientInfo;

  @Column({ type: 'simple-json', nullable: false })
  secrets!: { rootShard: string; bip32Shard: string };

  @Column({ type: 'simple-json', nullable: false })
  secretsInfo!: { threshold: number; bip32Path: string; bip32PathIndex: number };

  @Column()
  lastUsedTimestamp!: number;
}

import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inpage_dapps_v2' })
export default class InpageDApp extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  origin!: string;

  @Column({ default: '0x1' })
  lastUsedChainId!: string;

  @Column()
  lastUsedAccount!: string;

  @Column()
  lastUsedTimestamp!: number;

  @Column({ type: 'simple-json' })
  metadata!: { title: string; icon: string; desc?: string };
}

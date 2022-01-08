import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inpage_dapps' })
export default class InpageDApp extends BaseEntity {
  @PrimaryColumn({ type: 'text' })
  origin!: string;

  @Column({ default: '0x1' })
  lastUsedChainId!: string;

  @Column()
  lastUsedAccount!: string;
}

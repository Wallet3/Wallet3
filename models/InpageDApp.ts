import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inpage_dapps' })
export default class InpageDApp extends BaseEntity {
  @PrimaryColumn()
  origin!: string;

  @Column({ default: 1 })
  lastUsedChainId!: number;

  @Column()
  lastUsedAccount!: string;
}

import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inpage_dapps' })
export default class InpageDApp extends BaseEntity {
  @PrimaryColumn()
  href!: string;

  @Column({ default: 1 })
  lastUsedChainId!: number;

  @Column()
  lastUsedAccount!: string;
}

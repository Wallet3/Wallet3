import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inpage_apps' })
export default class Transaction extends BaseEntity {
  @PrimaryColumn()
  href!: string;

  @Column({ default: 1 })
  lastUsedChainId!: number;

  @Column()
  lastUsedAccount!: string;
}

import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'chains' })
export default class Transaction extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  symbol!: string;

  @Column()
  color!: string;

  @Column({ type: 'simple-json' })
  rpcUrls!: string[];

  @Column()
  explorer!: string;
}

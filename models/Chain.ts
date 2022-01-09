import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'chains' })
export default class Chain extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  symbol!: string;

  @Column()
  color!: string;

  @Column({ type: 'simple-json' })
  rpcUrls!: string[];

  @Column()
  explorer!: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @Column({ nullable: true, type: 'simple-json' })
  customize?: { color?: string };
}

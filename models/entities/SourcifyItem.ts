import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sourcify_contracts' })
export default class SourcifyMetadata extends BaseEntity {
  @PrimaryColumn()
  contract!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'simple-json', nullable: true })
  data!: any;

  @Column({ default: 0 })
  lastUpdatedTimestamp!: number;
}

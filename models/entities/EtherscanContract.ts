import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'etherscan_contracts' })
export default class EtherscanContract extends BaseEntity {
  @PrimaryColumn()
  contract!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'simple-json', nullable: true })
  abi!: any;

  @Column({ type: 'text', nullable: true })
  sourceCode?: string;

  @Column({ default: 0 })
  lastUpdatedTimestamp!: number;
}

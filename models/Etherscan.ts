import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'etherscan_contracts' })
export default class EtherscanContract extends BaseEntity {
  @PrimaryColumn()
  contract!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'simple-json' })
  abi!: any;

  @Column({ type: 'text', nullable: true })
  sourceCode?: string;
}

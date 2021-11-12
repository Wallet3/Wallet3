import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { BigNumberish, providers } from 'ethers';

@Entity({ name: 'transactions' })
export default class Transaction extends BaseEntity {
  @PrimaryColumn()
  hash!: string;

  @Column()
  chainId!: number;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column()
  value!: string;

  @Column()
  gas!: number;

  @Column()
  gasPrice!: number;

  @Column({ default: 0 })
  priorityPrice!: number;

  @Column()
  nonce!: number;

  @Column({ type: 'text', default: '' })
  data!: string;

  @Column()
  timestamp!: number;

  @Column({ nullable: true })
  blockNumber?: number;

  @Column({ nullable: true })
  blockHash?: string;

  @Column({ nullable: true })
  status?: boolean;

  @Column({ nullable: true })
  transactionIndex?: number;

  @Column({ nullable: true })
  gasUsed?: number;

  @Column({ nullable: true, type: 'simple-json' })
  readableInfo: { type: 'transfer' } & any;
}

export interface TransferInfo {
  symbol?: string;
  recipient?: string;
  amountWei?: string;
  decimals?: number;
  amount?: string;
}

export type ReadableInfo = { type: 'transfer' } & TransferInfo;

export interface ITransaction extends providers.TransactionRequest {
  hash?: string;

  chainId?: number;

  timestamp?: number;

  blockNumber?: number;

  blockHash?: string;

  status?: boolean;

  gasUsed?: number;

  readableInfo?: ReadableInfo;
}

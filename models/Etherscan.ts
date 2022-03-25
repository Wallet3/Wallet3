import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'contracts' })
export default class Contract extends BaseEntity {
  @PrimaryColumn()
  contract!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'simple-json' })
  abi!: string;
}

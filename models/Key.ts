import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'keys' })
export default class Key extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  type?: number; // mnemonic, privkey, keystore

  @Column()
  secret!: string;

  @Column({ default: 10 })
  addrs!: number;

  @Column({ type: 'text' })
  xprvkey!: string;

  @Column({ default: `m/44''/60''/0''/0`, type: 'text' })
  basePath!: string;

  @Column({ default: 0 })
  basePathIndex!: number;
}

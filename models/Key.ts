import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'keys' })
export default class Key extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  saltIv?: string;

  @Column()
  salt!: string;

  @Column({ nullable: true })
  mnIv?: string;

  @Column({ nullable: true })
  type?: number; // mnemonic, privkey, keystore

  @Column({ nullable: true })
  kc_unique?: string;

  @Column({ default: 10 })
  addrs!: number;

  @Column({ default: `m/44''/60''/0''/0`, type: 'text' })
  basePath!: string;

  @Column({ default: 0 })
  basePathIndex!: number;
}

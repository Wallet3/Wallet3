import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'cloud_address_tags' })
export default class AddressTag extends BaseEntity {
  @PrimaryColumn()
  address!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'text', nullable: true })
  publicName?: string;

  @Column({ type: 'simple-json', nullable: true })
  labels?: string[];

  @Column({ type: 'simple-json', nullable: true })
  warnings?: string[];

  @Column({ type: 'text', nullable: true })
  alert?: string;

  @Column({ type: 'simple-json', nullable: true })
  extra?: any;

  @Column({ default: 0 })
  lastUpdatedTimestamp!: number;

  get dangerous() {
    return (this.warnings?.length ?? 0) > 0 || (this.publicName?.includes('Fake_Phishing') ?? false);
  }
}

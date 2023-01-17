import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'url_tags' })
export default class UrlTag extends BaseEntity {
  @PrimaryColumn()
  hostname!: string;

  @Column({ type: 'boolean', default: false })
  dangerous?: boolean;

  @Column({ type: 'simple-json', nullable: true })
  extra?: any;

  @Column({ default: 0 })
  lastUpdatedTimestamp!: number;
}

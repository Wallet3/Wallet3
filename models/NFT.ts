import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

import { NFTMetadata } from '../viewmodels/transferring/NonFungibleTokenTransferring';

@Entity({ name: 'nfts' })
export default class NFT extends BaseEntity {
  @PrimaryColumn()
  contract!: string;

  @Column()
  tokenId!: string;

  @Column({ nullable: false })
  chainId!: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata!: NFTMetadata;
}

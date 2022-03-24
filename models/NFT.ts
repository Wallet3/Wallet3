import { makeObservable, observable, runInAction } from 'mobx';

import { NFT } from '../viewmodels/transferring/NonFungibleTokenTransferring';
import { convertRaribleNftToNft } from '../viewmodels/services/NftTransformer';
import { getNftById } from '../common/apis/Rarible';

export abstract class NonFungibleToken {
  metadata: NFT | null = null;

  readonly chainId: number;
  readonly address: string;
  readonly owner: string;
  readonly tokenId: string;

  constructor({
    contract,
    tokenId,
    chainId,
    fetchMetadata,
  }: {
    contract: string;
    tokenId: string;
    chainId: number;
    fetchMetadata?: boolean;
  }) {
    this.address = contract;
    this.chainId = chainId;
    this.owner = tokenId;
    this.tokenId = tokenId;

    makeObservable(this, { metadata: observable });

    if (fetchMetadata) this.fetchMetadata();
  }

  async fetchMetadata() {
    switch (this.chainId) {
      case 1:
      case 137:
        const nft = await getNftById(this.address, this.tokenId, this.chainId === 1 ? 'ethereum' : 'polygon');
        if (nft) runInAction(() => (this.metadata = convertRaribleNftToNft(nft)));
        break;
      case 56:
        break;
    }
  }
}

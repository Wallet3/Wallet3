import { makeObservable, observable } from 'mobx';

import { NFT } from '../viewmodels/transferring/NonFungibleTokenTransferring';
import { convertRaribleNftToNft } from '../viewmodels/services/NftTransformer';
import { getNftById } from '../common/apis/Rarible';

export abstract class NonFungibleToken {
  metadata: NFT | null = null;

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
    makeObservable(this, { metadata: observable });

    if (!fetchMetadata) return;
    
    switch (chainId) {
      case 1:
      case 137:
        getNftById(contract, tokenId, chainId === 1 ? 'ethereum' : 'polygon').then((nft) => {
          if (!nft) return;
          this.metadata = convertRaribleNftToNft(nft);
        });
        break;
      case 56:
        break;
    }
  }
}

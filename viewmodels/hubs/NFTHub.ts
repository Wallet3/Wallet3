import Database from '../../models/Database';
import { INetwork } from '../../common/Networks';
import NFT from '../../models/NFT';
import { NftsByOwner } from '../../common/apis/Rarible.types';
import { convertRaribleNftToNft } from '../services/NftTransformer';
import { getNftById } from '../../common/apis/Rarible';

class NFTHub {
  get table() {
    return Database.nfts;
  }

  async fillRaribleNFTs(network: INetwork, result?: NftsByOwner) {
    if (!result) return;
    if (!this.table) return;

    const lostItems = result.items.filter((i) => !i.deleted && !i.meta);
    const length = Math.ceil(lostItems.length / 10);

    for (let i = 0; i < length; i++) {
      const requests = lostItems.slice(i * 10, (i + 1) * 10).map(async (item) => {
        let nft = await this.table.findOne({
          where: { contract: item.contract, tokenId: item.tokenId, chainId: network.chainId },
        });

        let { metadata } = nft || {};

        if (!nft) {
          const raribleNft = await getNftById(item.contract, item.tokenId, network.network.toLowerCase() as any);

          if (!raribleNft) return;

          item.meta = raribleNft.meta;
          metadata = convertRaribleNftToNft(raribleNft);

          nft = new NFT();
          nft.chainId = network.chainId;
          nft.contract = item.contract;
          nft.tokenId = item.tokenId;
          nft.metadata = metadata;
          nft.save();
        }

        if (!metadata) return;

        item.meta = {
          name: metadata.title || '',
          description: metadata.description || '',
          attributes: metadata.attributes,
          image: {
            url: {
              ORIGINAL: metadata.images?.[0] || '',
              BIG: metadata.images?.[1] || '',
              PREVIEW: metadata.images?.[2] || '',
            },
            meta: {
              ORIGINAL: { type: metadata.types?.[0] },
              BIG: { type: metadata.types?.[1] },
              PREVIEW: { type: metadata.types?.[2] },
            },
          },
        };
      });

      await Promise.all(requests);
    }

    return result;
  }
}

export default new NFTHub();

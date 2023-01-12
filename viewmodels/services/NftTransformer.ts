import { BounceResponse, Nfts1155, Nfts721 } from '../../common/apis/Bounce.types';
import { Nft, NftsByOwner } from '../../common/apis/Rarible.types';
import { NftsByOwnerV2, RaribleItem } from '../../common/apis/Rarible.v2.types';

import { AlchemyNFTs } from '../../common/apis/Alchemy.types.nfts';
import { NFTMetadata } from '../transferring/NonFungibleTokenTransferring';
import { OpenseaAssetsResponse } from '../../common/apis/Opensea.types';

const convertProtocol = (items: (string | undefined)[]) => {
  return items
    .map((i) => (i?.startsWith('ipfs://') ? i.replace('ipfs://', 'https://ipfs.io/ipfs/') : i))
    .filter((i) => i) as string[];
};

export function convertBounceToNfts(result?: BounceResponse) {
  if (!result) return;

  const convertToNft = (item: Nfts1155 | Nfts721, images: string[]) => {
    return {
      id: `${item.contract_addr}:${item.token_id}`,
      contract: item.contract_addr,
      tokenId: item.token_id,
      title: item.name,
      description: item.description || item.metadata?.description,
      previews: images,
      previewTypes: [],
      images,
      types: [],
    };
  };

  try {
    const erc1155 = result.data.nfts1155.map((item) => {
      const images = convertProtocol([item.image, item.metadata?.image]);
      return convertToNft(item, images);
    });

    const erc721 = result.data.nfts721.map((item) => {
      const images = convertProtocol([item.image, item.metadata?.image, item.metadata?.gif_url, item.metadata?.mp4_url]);
      return convertToNft(item, images);
    });

    return erc1155.concat(erc721).filter((i) => i.images.some((img) => img?.startsWith('http')));
  } catch (error) {}
}

function convertRaribleV2NftToNft(item: RaribleItem): NFTMetadata {
  const images = item.meta.content.map((i) => i.url);
  const types = item.meta.content.map((i) => i.mimeType);

  return {
    contract: item.contract.split(':')[1] || item.contract,
    id: item.id,
    tokenId: item.tokenId,
    title: item.meta.name,
    images,
    types,
    previews: images,
    previewTypes: types,
    attributes: item.meta.attributes,
  };
}

export function convertRaribleV2ResultToNfts(result: NftsByOwnerV2 | undefined, chain: string): NFTMetadata[] | undefined {
  if (!result) return;

  chain = chain.toUpperCase();

  try {
    return result.items.filter((i) => i.blockchain === chain).map(convertRaribleV2NftToNft);
  } catch (error) {}
}

export function convertOpenseaAssetsToNft(result?: OpenseaAssetsResponse): NFTMetadata[] | undefined {
  if (!result) return;

  return result.assets.map((a) => {
    const previews = convertProtocol([a.image_preview_url, a.image_url, a.animation_url]);
    const images = convertProtocol([a.image_url, a.image_preview_url, a.animation_url]);

    return {
      id: `${a.asset_contract.address}:${a.token_id}`,
      title: a.name,
      contract: a.asset_contract.address,
      description: a.description,
      tokenId: a.token_id,
      attributes: a.traits.map((trait) => {
        return { key: trait.trait_type, value: trait.value };
      }),
      images,
      types: [],
      previewTypes: [],
      previews,
    };
  });
}

export function convertAlchemyToNfts(result?: AlchemyNFTs): NFTMetadata[] | undefined {
  if (!result) return;

  return result.ownedNfts
    .filter((n) => n.spamInfo.isSpam.toLowerCase() === 'false')
    .map((n) => {
      const previews = convertProtocol([n.metadata.image, ...n.media.map((n) => n.thumbnail)]);
      const images = convertProtocol([n.metadata.image, ...n.media.map((m) => m.raw), ...n.media.map((n) => n.thumbnail)]);

      return {
        contract: n.contract.address,
        id: `${n.contract.address}:${n.id.tokenId}`,
        tokenId: n.id.tokenId,
        images,
        types: [],
        description: n.description,
        title: n.metadata.name || n.contractMetadata.openSea.collectionName,
        previews,
        previewTypes: [],
        attributes: n.metadata.attributes.map((a) => {
          return { key: a.trait_type, value: a.value };
        }),
      };
    })
    .filter((n) => n.previews.length > 0);
}

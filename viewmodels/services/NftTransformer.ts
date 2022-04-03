import { BounceResponse, Nfts1155, Nfts721 } from '../../common/apis/Bounce.types';
import { Nft, NftsByOwner } from '../../common/apis/Rarible.types';

import { NFTMetadata } from '../transferring/NonFungibleTokenTransferring';
import { OpenseaAssetsResponse } from '../../common/apis/Opensea.types';

const convertProtocol = (items: (string | undefined)[]) => {
  return items
    .map((i) => (i?.startsWith('ipfs://') ? i.replace('ipfs://', 'https://ipfs.io/ipfs/') : i))
    .filter((i) => i) as string[];
};

export function convertRaribleNftToNft(item: Nft) {
  return {
    id: item.id,
    contract: item.contract,
    tokenId: item.tokenId,
    title: item.meta?.name,
    description: item.meta?.description,
    attributes: item.meta?.attributes,
    previews: [item.meta?.image?.url?.BIG, item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.PREVIEW],
    previewTypes: [
      item.meta?.image?.meta?.BIG?.type,
      item.meta?.image?.meta?.ORIGINAL?.type,
      item.meta?.image?.meta?.PREVIEW?.type,
    ],
    images: [item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.BIG, item.meta?.image?.url?.PREVIEW],
    types: [item.meta?.image?.meta?.ORIGINAL?.type, item.meta?.image?.meta?.BIG?.type, item.meta?.image?.meta?.PREVIEW?.type],
  };
}

export function convertRaribleResultToNfts(result?: NftsByOwner): NFTMetadata[] | undefined {
  if (!result) return;

  try {
    return result.items
      .filter((i) => !i.deleted && (i.meta?.image?.url?.PREVIEW || i.meta?.image?.url?.ORIGINAL))
      .map(convertRaribleNftToNft);
  } catch (error) {}
}

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

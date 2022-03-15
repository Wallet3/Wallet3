import { BounceResponse } from '../../common/apis/Bounce.types';
import { NFT } from '../transferring/NonFungibleTokenTransferring';
import { NftsByOwner } from '../../common/apis/Rarible.types';

export function convertRaribleResultToNft(result?: NftsByOwner): NFT[] | undefined {
  if (!result) return;

  try {
    return result.items
      .filter((i) => !i.deleted && (i.meta?.image?.url?.PREVIEW || i.meta?.image?.url?.ORIGINAL))
      .map((item) => {
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
          types: [
            item.meta?.image?.meta?.ORIGINAL?.type,
            item.meta?.image?.meta?.BIG?.type,
            item.meta?.image?.meta?.PREVIEW?.type,
          ],
        };
      });
  } catch (error) {}
}

export function convertBounceToNft(result?: BounceResponse) {
  if (!result) return;

  const convertProtocol = (items: (string | undefined)[]) => {
    return items
      .map((i) => (i?.startsWith('ipfs://') ? i.replace('ipfs://', 'https://ipfs.io/ipfs/') : i))
      .filter((i) => i) as string[];
  };

  try {
    const erc1155 = result.data.nfts1155.map((item) => {
      const images = convertProtocol([item.image, item.metadata?.image]);

      return {
        id: `${item.contract_addr}:${item.token_id}`,
        contract: item.contract_addr,
        tokenId: item.token_id,
        title: item.name,
        description: item.description,
        previews: images,
        previewTypes: [],
        images,
        types: [],
      };
    });

    const erc721 = result.data.nfts721.map((item) => {
      const images = convertProtocol([item.image, item.metadata?.image, item.metadata?.gif_url, item.metadata?.mp4_url]);

      return {
        id: `${item.contract_addr}:${item.token_id}`,
        contract: item.contract_addr,
        tokenId: item.token_id,
        title: item.name,
        description: item.description,
        previews: images,
        previewTypes: [],
        images,
        types: [],
      };
    });

    return erc1155.concat(erc721).filter((i) => i.images.some((img) => img?.startsWith('http')));
  } catch (error) {}
}

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

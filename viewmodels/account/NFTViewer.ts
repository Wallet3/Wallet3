import { action, makeObservable, observable, runInAction } from 'mobx';
import { convertBounceToNfts, convertRaribleResultToNfts, convertRaribleV2ResultToNfts } from '../services/NftTransformer';
import { getNftsByOwner, getNftsByOwnerV2 } from '../../common/apis/Rarible';

import NFTHub from '../hubs/NFTHub';
import { NFTMetadata } from '../transferring/NonFungibleTokenTransferring';
import Networks from '../Networks';
import { getBounceNfts } from '../../common/apis/Bounce';
import { startLayoutAnimation } from '../../utils/animations';

export class NFTViewer {
  private cache = new Map<number, NFTMetadata[]>();

  readonly owner: string;
  nfts: NFTMetadata[] = [];

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, { nfts: observable, setNFTs: action });
  }

  setNFTs(nfts: NFTMetadata[]) {
    startLayoutAnimation();
    this.nfts = nfts;
  }

  async refresh(force = false) {
    const { current } = Networks;
    const cacheItems = this.cache.get(current.chainId);

    if (cacheItems && !force) {
      runInAction(() => this.setNFTs(cacheItems));
      return;
    }

    runInAction(() => this.setNFTs([]));

    let result: NFTMetadata[] | undefined;

    switch (current.chainId) {
      case 1:
      case 137:
        // result = convertRaribleResultToNfts(
        //   await NFTHub.fillRaribleNFTs(
        //     current,
        //     await getNftsByOwner(this.owner, { chain: current.network.toLowerCase(), size: 500 })
        //   )
        // );
        result = convertRaribleV2ResultToNfts(await getNftsByOwnerV2(this.owner, current.network), current.network);
        break;
      case 56:
        result = convertBounceToNfts(await getBounceNfts(this.owner));
        break;
    }

    if (!result) {
      runInAction(() => this.setNFTs(cacheItems || []));
      return;
    }

    this.cache.set(current.chainId, result);

    runInAction(() => (this.nfts = result!));
  }
}

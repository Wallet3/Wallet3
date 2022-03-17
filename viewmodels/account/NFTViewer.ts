import { action, makeObservable, observable, runInAction } from 'mobx';
import { convertBounceToNft as convertBounceToNfts, convertOpenseaAssetsToNft, convertRaribleResultToNft as convertRaribleResultToNfts } from '../services/NftTransformer';

import { NFT } from '../transferring/NonFungibleTokenTransferring';
import Networks from '../Networks';
import { getBounceNfts } from '../../common/apis/Bounce';
import { getNftsByOwner } from '../../common/apis/Rarible';
import { getOpenseaNfts } from '../../common/apis/Opensea';
import { startLayoutAnimation } from '../../utils/animations';

export class NFTViewer {
  private cache = new Map<number, NFT[]>();

  readonly owner: string;
  nfts: NFT[] = [];

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, { nfts: observable, setNFTs: action });
  }

  setNFTs(nfts: NFT[]) {
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

    let result: NFT[] | undefined;

    switch (current.chainId) {
      case 1:
      case 137:
        result = convertRaribleResultToNfts(
          await getNftsByOwner(this.owner, { chain: current.network.toLowerCase(), size: 500 })
        );
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

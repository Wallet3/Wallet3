import { action, makeObservable, observable, runInAction } from 'mobx';

import { NFT } from '../transferring/NonFungibleTokenTransferring';
import Networks from '../Networks';
import { convertRaribleResultToNft } from '../services/NftTransformer';
import { getNftsByOwner } from '../../common/apis/Rarible';
import { setString } from 'expo-clipboard';
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

    const result = convertRaribleResultToNft(
      await getNftsByOwner(this.owner, { chain: current.network.toLowerCase(), size: 500 })
    );

    if (!result) {
      runInAction(() => this.setNFTs(cacheItems || []));
      return;
    }

    this.cache.set(current.chainId, result);

    runInAction(() => (this.nfts = result));
  }
}

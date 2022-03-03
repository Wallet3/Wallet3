import { makeObservable, observable, runInAction } from 'mobx';

import Networks from '../Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { getNftsByOwner } from '../../common/apis/Rarible';

export class NFTViewer {
  private cache = new Map<number, Nft[]>();

  readonly owner: string;
  nfts: Nft[] = [];

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, { nfts: observable });
  }

  async refresh(force = false) {
    const { current } = Networks;
    const cacheItems = this.cache.get(current.chainId);

    if (cacheItems && !force) {
      runInAction(() => (this.nfts = cacheItems));
      return;
    }

    const result = await getNftsByOwner(this.owner, { chain: current.network.toLowerCase(), size: 100 });
    if (!result) return;

    const { items } = result;
    const validItems = items.filter((i) => i.meta?.image?.meta);
    this.cache.set(current.chainId, validItems);
    
    console.log(validItems.length, items.length);

    runInAction(() => (this.nfts = validItems));
  }
}

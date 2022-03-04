import { makeObservable, observable, runInAction } from 'mobx';

import Networks from '../Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { getNftsByOwner } from '../../common/apis/Rarible';
import { setString } from 'expo-clipboard';

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

    const result = await getNftsByOwner(this.owner, { chain: current.network.toLowerCase(), size: 500 });
    if (!result) return;

    const { items } = result;
    if (!Array.isArray(items)) {
      runInAction(() => (this.nfts = cacheItems || []));
      return;
    }

    const validItems = items.filter((i) => !i.deleted && (i.meta?.image?.url?.PREVIEW || i.meta?.image?.url?.ORIGINAL));
    this.cache.set(current.chainId, validItems);

    runInAction(() => (this.nfts = validItems));
  }
}

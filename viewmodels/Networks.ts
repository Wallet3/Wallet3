import * as ethers from 'ethers';

import { INetwork, PublicNetworks } from '../common/Networks';
import { action, makeObservable, observable } from 'mobx';

import providers from '../configs/providers.json';

class Networks {
  current: INetwork = PublicNetworks[0];
  cache = new Map<number, ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider>();

  get Ethereum() {
    return PublicNetworks[0];
  }

  get Optimism() {
    return PublicNetworks[2];
  }

  get Arbitrum() {
    return PublicNetworks[1];
  }

  constructor() {
    makeObservable(this, { current: observable, switch: action });
  }

  switch(network: INetwork) {
    this.current = network;
  }

  get currentProvider() {
    const chainId = this.current.chainId;

    if (this.cache.has(chainId)) {
      return this.cache.get(chainId)!;
    }

    const [url] = providers[chainId] as string[];

    const provider = url.startsWith('ws')
      ? new ethers.providers.WebSocketProvider(url, chainId)
      : new ethers.providers.JsonRpcProvider(url, chainId);

    this.cache.set(chainId, provider);

    return provider;
  }
}

export default new Networks();

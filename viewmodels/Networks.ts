import * as ethers from 'ethers';

import { INetwork, PublicNetworks } from '../common/Networks';
import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
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

  get Polygon() {
    return PublicNetworks[3];
  }

  get all() {
    return PublicNetworks;
  }

  constructor() {
    makeObservable(this, { current: observable, switch: action, reset: action });

    AsyncStorage.getItem('network').then((chainId) => {
      const chain = Number(chainId || 1);
      runInAction(() => (this.current = PublicNetworks.find((n) => n.chainId === chain) || PublicNetworks[0]));
    });
  }

  switch(network: INetwork) {
    if (this.current === network) return;

    this.current = network;
    AsyncStorage.setItem('network', JSON.stringify(network.chainId));
  }

  has(chainId: number | string) {
    return PublicNetworks.some((n) => n.chainId === Number(chainId));
  }

  find(chainId: number | string) {
    return PublicNetworks.find((n) => n.chainId === Number(chainId));
  }

  reset() {
    this.switch(this.Ethereum);
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

  get MainnetWsProvider() {
    const [ws] = providers[1] as string[];
    const provider = new ethers.providers.WebSocketProvider(ws, 1);

    return provider;
  }
}

export default new Networks();

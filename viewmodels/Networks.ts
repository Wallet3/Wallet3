import * as ethers from 'ethers';

import { INetwork, PublicNetworks } from '../common/Networks';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Chain from '../models/Chain';
import Database from '../models/Database';
import providers from '../configs/providers.json';

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

class Networks {
  current: INetwork = PublicNetworks[0];
  cache = new Map<number, ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider>();
  userChains: INetwork[] = [];

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
    return PublicNetworks.concat(this.userChains);
  }

  constructor() {
    makeObservable(this, {
      current: observable,
      switch: action,
      reset: action,
      userChains: observable,
      add: action,
      all: computed,
    });
  }

  async init() {
    const chains = await Database.chains.find();

    runInAction(() => {
      this.userChains = chains
        .filter((c) => !PublicNetworks.find((n) => n.chainId === Number(c.id)))
        .map<INetwork>((c) => {
          return {
            chainId: Number(c.id),
            color: c.customize?.color || '#7B68EE',
            comm_id: '',
            explorer: c.explorer,
            symbol: c.symbol,
            defaultTokens: [],
            network: c.name,
            rpcUrls: c.rpcUrls,
          };
        });
    });

    AsyncStorage.getItem('network').then((chainId) => {
      const chain = Number(chainId || 1);
      runInAction(() => (this.current = this.all.find((n) => n.chainId === chain) || PublicNetworks[0]));
    });
  }

  switch(network: INetwork) {
    if (this.current === network) return;

    this.current = network;
    AsyncStorage.setItem('network', JSON.stringify(network.chainId));
  }

  has(chainId: number | string) {
    return this.all.some((n) => n.chainId === Number(chainId));
  }

  find(chainId: number | string) {
    return this.all.find((n) => n.chainId === Number(chainId));
  }

  reset() {
    this.switch(this.Ethereum);
  }

  add(chain: AddEthereumChainParameter) {
    if (this.has(chain.chainId)) return;

    const nc = new Chain();
    nc.id = chain.chainId;
    nc.name = chain.chainName;
    nc.explorer = chain.blockExplorerUrls?.[0] || '';
    nc.rpcUrls = chain.rpcUrls;
    nc.customize = { color: '#7B68EE' };
    nc.symbol = chain.nativeCurrency.symbol;

    this.userChains.push({
      chainId: Number(chain.chainId),
      color: nc.customize.color!,
      network: nc.name,
      comm_id: '',
      defaultTokens: [],
      explorer: nc.explorer,
      symbol: nc.symbol,
    });

    return nc.save();
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

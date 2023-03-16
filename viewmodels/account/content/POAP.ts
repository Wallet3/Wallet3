import { BigNumber, ethers } from 'ethers';
import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAY } from '../../../utils/time';
import POAPABI from '../../../abis/POAP.json';
import axios from 'axios';
import { eth_call } from '../../../common/RPC';

const POAPAddress = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

export interface POAPBadge {
  tokenId: string;
  eventId: string;

  tokenURI: string;
  metadata: {
    description: string;
    external_url: string;
    home_url: string;
    image_url: string;
    name: string;
    year: number;
    tags: string[];
  };
}

export class POAP {
  readonly contract: ethers.Contract;
  readonly owner: string;

  badges: (POAPBadge | '')[] = [];
  primaryBadge: POAPBadge | '' | null = null;
  loading = false;

  constructor(owner: string) {
    this.owner = owner;
    this.contract = new ethers.Contract(POAPAddress, POAPABI);

    makeObservable(this, { badges: observable, loading: observable, primaryBadge: observable });

    AsyncStorage.getItem(`${owner}-primaryBadge`).then((primaryBadge) => {
      if (!primaryBadge) return;
      runInAction(() => (this.primaryBadge = JSON.parse(primaryBadge)));
    });
  }

  async getBalance(chainId = 1) {
    try {
      const data = this.contract.interface.encodeFunctionData('balanceOf', [this.owner]);
      const resp = await eth_call(chainId, { from: this.owner, to: POAPAddress, data });
      return BigNumber.from(resp).toNumber();
    } catch (error) {
      return 0;
    }
  }

  async getTokenDetails(owner: string, count: number, chainId = 1) {
    const details: { tokenId: string; eventId: string }[] = [];

    for (let i = 0; i < count; i++) {
      const data = this.contract.interface.encodeFunctionData('tokenDetailsOfOwnerByIndex', [owner, i]);
      const resp: string = await eth_call(chainId, { from: owner, to: POAPAddress, data });
      const [tokenId, eventId] = this.contract.interface.decodeFunctionResult('tokenDetailsOfOwnerByIndex', resp);
      details.push({ tokenId: tokenId.toString(), eventId: eventId.toString() });
    }

    const result: {
      tokenId: string;
      eventId: string;
      tokenURI: string;
      contract: string;
      metadata: {
        description: string;
        external_url: string;
        home_url: string;
        image_url: string;
        name: string;
        year: number;
        tags: string[];
      };
    }[] = [];

    for (let basic of details) {
      const data = this.contract.interface.encodeFunctionData('tokenURI', [basic.tokenId]);
      const resp: string = await eth_call(chainId, { from: owner, to: POAPAddress, data });
      const [tokenURI] = this.contract.interface.decodeFunctionResult('tokenURI', resp);

      const metadata = (await axios.get(tokenURI)).data as {
        description: string;
        external_url: string;
        home_url: string;
        image_url: string;
        name: string;
        year: number;
        tags: string[];
      };

      result.push({ ...basic, tokenURI, metadata, contract: this.contract.address });
    }

    return result;
  }

  async checkDefaultBadge() {
    if (this.primaryBadge) return;
    this.refresh();
  }

  async refresh() {
    const key = `${this.owner}-poap-badges`;

    if (this.badges.length > 0) return;

    const cache = await AsyncStorage.getItem(key);
    if (cache) {
      const { badges, timestamp } = JSON.parse(cache);
      runInAction(() => (this.badges = badges.concat('')));
      if (Date.now() < timestamp + 2 * DAY) return;
    }

    const save = (badges: any[]) => AsyncStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), badges }));
    runInAction(() => (this.loading = true));

    try {
      const [count, xdaiCount] = await Promise.all([this.getBalance(1), this.getBalance(100)]);
      if (count === 0 && xdaiCount === 0) return;

      const badges: (POAPBadge | '')[] = [];

      if (count > 0) {
        badges.push(...(await this.getTokenDetails(this.owner, count, 1)));
      }

      if (xdaiCount > 0) {
        badges.push(...(await this.getTokenDetails(this.owner, xdaiCount, 100)));
      }

      if (badges.length === 0) {
        save(badges);
        return;
      }

      runInAction(() => (this.badges = badges.concat(''))); // attach an empty string to set 'none'

      if (this.primaryBadge === null) this.setPrimaryBadge(badges[0]);

      save(badges);
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  setPrimaryBadge(badge: POAPBadge | '') {
    runInAction(() => (this.primaryBadge = badge));
    AsyncStorage.setItem(`${this.owner}-primaryBadge`, JSON.stringify(badge));
  }
}

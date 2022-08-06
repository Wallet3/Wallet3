import { BigNumber, ethers } from 'ethers';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { eth_call, getRPCUrls } from '../../common/RPC';

import AsyncStorage from '@react-native-async-storage/async-storage';
import POAPABI from '../../abis/POAP.json';
import axios from 'axios';

const POAPAddress = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

export interface POAPBadge {
  tokenId: BigNumber;
  eventId: BigNumber;

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

  badges: POAPBadge[] = [];
  primaryBadge: POAPBadge | null = null;

  constructor(owner: string) {
    this.owner = owner;
    this.contract = new ethers.Contract(POAPAddress, POAPABI);

    makeObservable(this, { badges: observable, primaryBadge: observable, setPrimaryBadge: action });

    AsyncStorage.getItem('primaryBadge').then((primaryBadge) => {
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
    const details = await Promise.all(
      new Array(count).fill(0).map(async (_, index) => {
        const data = this.contract.interface.encodeFunctionData('tokenDetailsOfOwnerByIndex', [owner, index]);
        const resp: string = await eth_call(chainId, { from: owner, to: POAPAddress, data });
        const [tokenId, eventId] = this.contract.interface.decodeFunctionResult('tokenDetailsOfOwnerByIndex', resp);

        return { tokenId, eventId } as { tokenId: BigNumber; eventId: BigNumber };
      })
    );

    return await Promise.all(
      details.map(async (basic) => {
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
        return { ...basic, tokenURI, metadata, contract: this.contract.address };
      })
    );
  }

  async refresh() {
    runInAction(() => (this.badges = []));
    const count = await this.getBalance();
    if (count === 0) return [];

    const badges = await this.getTokenDetails(this.owner, count);

    if (badges.length === 0) return [];

    runInAction(() => (this.badges = badges));

    if (!this.primaryBadge) this.setPrimaryBadge(badges[0]);

    console.log(badges);
    return badges;
  }

  setPrimaryBadge(badge: POAPBadge) {
    this.primaryBadge = badge;
    AsyncStorage.setItem('primaryBadge', JSON.stringify(badge));
  }
}

import { BigNumber, ethers } from 'ethers';
import { makeObservable, observable, runInAction } from 'mobx';

import POAPABI from '../../abis/POAP.json';
import axios from 'axios';

export const EthereumAddress = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

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

  constructor({
    provider,
    contractAddress,
    owner,
  }: {
    provider: ethers.providers.BaseProvider;
    contractAddress: string;
    owner: string;
  }) {
    this.owner = owner;
    this.contract = new ethers.Contract(contractAddress, POAPABI, provider);

    makeObservable(this, { badges: observable });
  }

  async getBalance() {
    try {
      const amount: BigNumber = await this.contract.balanceOf(this.owner);
      return amount.toNumber();
    } catch (error) {
      return 0;
    }
  }

  async getTokenDetails(address: string, count: number) {
    const details = await Promise.all(
      new Array(count).fill(0).map(async (_, index) => {
        return (await this.contract.tokenDetailsOfOwnerByIndex(address, index)) as {
          tokenId: BigNumber;
          eventId: BigNumber;
        };
      })
    );

    return await Promise.all(
      details.map(async (basic) => {
        const tokenURI = await this.contract.tokenURI(basic.tokenId);
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
    const count = await this.getBalance();
    if (count === 0) return [];

    const badges = await this.getTokenDetails(this.owner, count);
    console.log(badges);
    runInAction(() => (this.badges = badges));
  }
}

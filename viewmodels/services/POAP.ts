import { BigNumber, ethers } from 'ethers';

import POAPABI from '../../abis/POAP.json';
import axios from 'axios';

const ContractAddr = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

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

  constructor(provider: ethers.providers.BaseProvider) {
    this.contract = new ethers.Contract(ContractAddr, POAPABI, provider);
  }

  async balanceOf(address: string) {
    try {
      const amount: BigNumber = await this.contract.balanceOf(address);
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
        return { ...basic, tokenURI, metadata, contract: ContractAddr };
      })
    );
  }

  async getNFTs(address: string): Promise<POAPBadge[]> {
    const count = await this.balanceOf(address);
    if (count === 0) return [];

    return await this.getTokenDetails(address, count);
  }
}

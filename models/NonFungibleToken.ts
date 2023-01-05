import { makeObservable, observable, runInAction } from 'mobx';

import { NFTMetadata } from '../viewmodels/transferring/NonFungibleTokenTransferring';
import { convertRaribleNftToNft } from '../viewmodels/services/NftTransformer';
import { eth_call } from '../common/RPC';
import { ethers } from 'ethers';
import { getNftById } from '../common/apis/Rarible';
import isURL from 'validator/lib/isURL';

export interface NonFungibleTokenJsonMetadata {
  name: string;
  description: string;
  external_url: string;
  image: string;
  animation_url?: string;
}

export abstract class NonFungibleToken {
  metadata: NonFungibleTokenJsonMetadata | null = null;

  readonly chainId: number;
  readonly address: string;
  readonly owner: string;
  readonly tokenId: string;
  contract!: ethers.Contract;

  get interface() {
    return this.contract.interface;
  }

  constructor({
    contract,
    tokenId,
    chainId,
    fetchMetadata,
  }: {
    contract: string;
    tokenId: string;
    chainId: number;
    fetchMetadata?: boolean;
  }) {
    this.address = contract;
    this.chainId = chainId;
    this.owner = tokenId;
    this.tokenId = tokenId;

    makeObservable(this, { metadata: observable });
  }

  abstract getMetadataURI(): Promise<string>;

  async fetchMetadata() {
    const tokenURI = await this.getMetadataURI();
    if (!isURL(tokenURI)) return;

    try {
      const resp = await fetch(tokenURI);
      const data = (await resp.json()) as NonFungibleTokenJsonMetadata;
      if (!data) return;

      runInAction(() => (this.metadata = data));
    } catch (error) {}
  }

  protected async call(func: string, params?: any[]) {
    const call_data = this.interface.encodeFunctionData(func, params);

    try {
      const results = this.contract.interface.decodeFunctionResult(
        func,
        (await eth_call<string>(this.chainId, { to: this.address, data: call_data })) || ''
      );

      return results;
    } catch (e) {}
  }
}

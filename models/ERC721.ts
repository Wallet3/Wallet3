import { ethers, utils } from 'ethers';

import ERC721ABI from '../abis/ERC721.json';
import { NonFungibleToken } from './NonFungibleToken';
import { eth_call } from '../common/RPC';

export class ERC721Token extends NonFungibleToken {
  constructor(props: { contract: string; tokenId: string; chainId: number; owner: string; fetchMetadata?: boolean }) {
    super(props);
    this.contract = new ethers.Contract(this.address, ERC721ABI);

    if (props.fetchMetadata) this.fetchMetadata();
  }

  async ownerOf(tokenId: string) {
    const call_ownerOf = this.encodeOwnerOf(tokenId);

    try {
      const [owner] = this.contract.interface.decodeFunctionResult(
        'ownerOf',
        (await eth_call<string>(this.chainId, { to: this.address, data: call_ownerOf })) || ''
      ) as string[];

      return utils.isAddress(owner) ? utils.getAddress(owner) : undefined;
    } catch (error) {}
  }

  encodeTransferFrom(owner: string, to: string, tokenId: string) {
    return this.interface.encodeFunctionData('transferFrom', [owner, to, tokenId]);
  }

  encodeOwnerOf(tokenId: string) {
    return this.interface.encodeFunctionData('ownerOf', [tokenId]);
  }

  async getMetadataURI() {
    try {
      const [tokenURI] = (await this.call('tokenURI', [this.tokenId])) as [string];
      return tokenURI;
    } catch (error) {}

    return '';
  }
}

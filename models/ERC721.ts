import { ethers, utils } from 'ethers';

import ERC721ABI from '../abis/ERC721.json';
import { NonFungibleToken } from './NFT';
import { eth_call } from '../common/RPC';

export class ERC721Token extends NonFungibleToken {
  readonly contract: ethers.Contract;

  chainId: number;
  readonly address: string;
  readonly owner: string;
  readonly tokenId: string;

  get interface() {
    return this.contract.interface;
  }

  constructor(props: { contract: string; tokenId: string; chainId: number; owner: string; fetchMetadata?: boolean }) {
    super(props);

    this.address = props.contract;
    this.contract = new ethers.Contract(this.address, ERC721ABI);

    this.chainId = props.chainId;
    this.owner = props.owner;
    this.tokenId = props.tokenId;
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
}

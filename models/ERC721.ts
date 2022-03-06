import ERC721ABI from '../abis/ERC721.json';
import { ethers } from 'ethers';

export class ERC721 {
  readonly contract: ethers.Contract;

  address: string;
  chainId: number;
  owner: string;

  get interface() {
    return this.contract.interface;
  }

  constructor(props: { contract: string; tokenId: string; chainId: number; owner: string }) {
    this.address = props.contract;
    this.contract = new ethers.Contract(this.address, ERC721ABI);
    this.chainId = props.chainId;
    this.owner = props.owner;
  }

  encodeTransferFrom(to: string, tokenId: string) {
    return this.interface.encodeFunctionData('transferFrom', [this.owner, to, tokenId]);
  }

  encodeOwnerOf(tokenId: string) {
    return this.interface.encodeFunctionData('ownerOf', [tokenId]);
  }
}

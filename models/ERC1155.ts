import ERC1155ABI from '../abis/ERC1155.json';
import { NonFungibleToken } from './NFT';
import { ethers } from 'ethers';

export class ERC1155Token extends NonFungibleToken {
  readonly contract: ethers.Contract;

  get interface() {
    return this.contract.interface;
  }

  constructor(props: { contract: string; tokenId: string; chainId: number; owner: string; fetchMetadata?: boolean }) {
    super(props);
    this.contract = new ethers.Contract(this.address, ERC1155ABI);
  }

  encodeBalanceOf(owner: string, tokenId: string) {
    return this.interface.encodeFunctionData('balanceOf', [owner, tokenId]);
  }

  encodeSafeTransferFrom(from: string, to: string, id: string, amount: string) {
    return this.interface.encodeFunctionData('safeTransferFrom', [from, to, id, amount, '0x00']);
  }
}

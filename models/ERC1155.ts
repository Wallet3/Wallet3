import { BigNumber, ethers } from 'ethers';

import ERC1155ABI from '../abis/ERC1155.json';

export class ERC1155Token {
  readonly contract: ethers.Contract;

  address: string;
  chainId: number;
  owner: string;

  get interface() {
    return this.contract.interface;
  }

  constructor(props: { contract: string; tokenId: string; chainId: number; owner: string }) {
    this.address = props.contract;
    this.contract = new ethers.Contract(this.address, ERC1155ABI);
    this.chainId = props.chainId;
    this.owner = props.owner;
  }

  encodeBalanceOf(owner: string, tokenId: string) {
    return this.interface.encodeFunctionData('balanceOf', [owner, tokenId]);
  }

  encodeSafeTransferFrom(from: string, to: string, id: string, amount: string) {
    return this.interface.encodeFunctionData('safeTransferFrom', [from, to, id, amount, '0x00']);
  }
}

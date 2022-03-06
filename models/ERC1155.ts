import ERC1155ABI from '../abis/ERC1155.json';
import { ethers } from 'ethers';

export class ERC1155 {
  readonly contract: ethers.Contract;

  address: string;
  chainId: number;

  constructor(props: { contract: string; tokenId: string; chainId: number }) {
    this.address = props.contract;
    this.contract = new ethers.Contract(this.address, ERC1155ABI);
    this.chainId = props.chainId;
  }
}

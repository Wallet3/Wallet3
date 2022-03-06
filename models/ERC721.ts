import ERC721ABI from '../abis/ERC721.json';
import { ethers } from 'ethers';

export class ERC721 {
  readonly contract: ethers.Contract;

  address: string;
  chainId: number;

  constructor(props: { contract: string; tokenId: string; chainId: number }) {
    this.address = props.contract;
    this.contract = new ethers.Contract(this.address, ERC721ABI);
    this.chainId = props.chainId;
  }
}

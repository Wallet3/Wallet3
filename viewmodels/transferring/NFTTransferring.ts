import { computed, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155 } from '../../models/ERC1155';
import { ERC721 } from '../../models/ERC721';
import { INetwork } from '../../common/Networks';
import { call } from '../../common/RPC';

interface NFT {
  tokenId: string;
  contract: string;
  title?: string;
  images: (string | undefined)[];
  type?: string;
}

interface IConstructor {
  nft: NFT;
  network: INetwork;
  account?: Account;
}

export class NFTTransferring extends BaseTransaction {
  readonly nft: NFT;
  erc721: ERC721;
  erc1155: ERC1155;
  nftType: 'erc721' | 'erc1155' | null = null;

  get isValidParams() {
    return (
      !this.initializing &&
      this.nonce >= 0 &&
      this.isValidGas &&
      this.network &&
      this.nftType &&
      !this.insufficientFee &&
      !this.isEstimatingGas &&
      !this.txException
    );
  }

  constructor(args: IConstructor) {
    super({ network: args.network, account: args.account || App.currentAccount! });

    this.nft = args.nft;
    this.erc721 = new ERC721({ ...args.network, ...args.nft, owner: this.account.address });
    this.erc1155 = new ERC1155({ ...args.network, ...args.nft, owner: this.account.address });

    makeObservable(this, { nftType: observable, isValidParams: computed });

    this.checkNFT();
  }

  async checkNFT() {
    const erc721Data = this.erc721.encodeOwnerOf(this.nft.tokenId);
    const erc1155Data = this.erc1155.encodeBalanceOf(this.account.address, this.nft.tokenId);

    const [erc721Owner, erc1155Balance] = await Promise.all([
      call<string>(this.network.chainId, { from: this.account.address, data: erc721Data, to: this.erc721.address }),
      call<string>(this.network.chainId, { from: this.account.address, data: erc1155Data, to: this.erc1155.address }),
    ]);

    if (erc721Owner === this.account.address) {
      runInAction(() => (this.nftType = 'erc721'));
    }

    try {
      if (BigInt(erc1155Balance || 0) > 0) {
        runInAction(() => (this.nftType = 'erc1155'));
      }
    } catch (error) {}
  }
}

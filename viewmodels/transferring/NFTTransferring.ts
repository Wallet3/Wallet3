import { Account } from '../account/Account';
import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { INetwork } from '../../common/Networks';

interface NFT {
  tokenId: string;
  contract: string;
  title?: string;
  images: (string | undefined)[];
}

interface IConstructor {
  nft: NFT;
  network: INetwork;
}

export class NFTTransferring extends BaseTransaction {
  readonly nft: NFT;

  constructor(args: IConstructor) {
    const account = App.currentAccount!;
    super({ network: args.network, account });

    this.nft = args.nft;
  }
}

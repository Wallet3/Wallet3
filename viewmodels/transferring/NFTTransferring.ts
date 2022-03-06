import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155 } from '../../models/ERC1155';
import { ERC721 } from '../../models/ERC721';
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
  erc721: ERC721;
  erc1155: ERC1155;

  constructor(args: IConstructor) {
    const account = App.currentAccount!;
    super({ network: args.network, account });

    this.nft = args.nft;
    this.erc721 = new ERC721({ ...args.network, ...args.nft });
    this.erc1155 = new ERC1155({ ...args.network, ...args.nft });
  }
}

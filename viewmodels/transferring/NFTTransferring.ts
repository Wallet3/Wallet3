import { BigNumber, providers } from 'ethers';
import { call, estimateGas } from '../../common/RPC';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155 } from '../../models/ERC1155';
import { ERC721 } from '../../models/ERC721';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';

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
  erc1155Balance = 0n;

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

  get txData() {
    return this.nftType === 'erc721'
      ? this.erc721.encodeTransferFrom(this.account.address, this.toAddress, this.nft.tokenId)
      : this.erc1155.encodeSafeTransferFrom(this.account.address, this.toAddress, this.nft.tokenId, `${this.erc1155Balance}`);
  }

  constructor(args: IConstructor) {
    super({ network: args.network, account: args.account || App.currentAccount! });

    this.nft = args.nft;
    this.erc721 = new ERC721({ ...args.network, ...args.nft, owner: this.account.address });
    this.erc1155 = new ERC1155({ ...args.network, ...args.nft, owner: this.account.address });

    makeObservable(this, { nftType: observable, isValidParams: computed });

    this.checkNFT();
  }

  private async checkNFT() {
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
        runInAction(() => {
          this.nftType = 'erc1155';
          this.erc1155Balance = BigInt(erc1155Balance!);
        });
      }
    } catch (error) {}

    if (this.toAddress) {
      setTimeout(() => this.estimateGas(), 0);
    }
  }

  async estimateGas() {
    if (!this.nftType) return;
    if (!this.toAddress) return;

    runInAction(() => (this.isEstimatingGas = true));

    const { gas, errorMessage } = await estimateGas(this.network.chainId, {
      from: this.account.address,
      data: this.txData,
      to: this.nft.contract,
    });

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  get txRequest(): providers.TransactionRequest {
    const tx: providers.TransactionRequest = {
      chainId: this.network.chainId,
      from: this.account.address,
      to: this.nft.contract,
      value: 0,
      nonce: this.nonce,
      data: this.txData,
      gasLimit: this.gasLimit,
      type: this.network.eip1559 ? 2 : 0,
    };

    if (tx.type === 0) {
      tx.gasPrice = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
    } else {
      tx.maxFeePerGas = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
      tx.maxPriorityFeePerGas = Number.parseInt((this.maxPriorityPrice * Gwei_1) as any);
    }

    return tx;
  }
}

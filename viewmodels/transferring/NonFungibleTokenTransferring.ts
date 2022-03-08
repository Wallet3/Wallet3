import { BigNumber, providers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { call, estimateGas } from '../../common/RPC';

import { Account } from '../account/Account';
import App from '../App';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155 } from '../../models/ERC1155';
import { ERC721 } from '../../models/ERC721';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';
import { startLayoutAnimation } from '../../utils/animations';

interface NFT {
  tokenId: string;
  contract: string;
  title?: string;
  images: (string | undefined)[];
  types: (string | undefined)[];
}

interface IConstructor {
  nft: NFT;
  network: INetwork;
  account?: Account;
}

export class NFTTransferring extends BaseTransaction {
  readonly nft: NFT;
  readonly erc721: ERC721;
  readonly erc1155: ERC1155;

  nftType: 'erc-721' | 'erc-1155' | null = null;
  erc1155Balance = BigInt(0);
  erc1155TransferAmount = 1;

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
    return this.nftType === 'erc-721'
      ? this.erc721.encodeTransferFrom(this.account.address, this.toAddress, this.nft.tokenId)
      : this.erc1155.encodeSafeTransferFrom(
          this.account.address,
          this.toAddress,
          this.nft.tokenId,
          `${this.erc1155TransferAmount}`
        );
  }

  constructor(args: IConstructor) {
    super({ network: args.network, account: args.account || App.currentAccount! });

    this.nft = args.nft;
    this.erc721 = new ERC721({ ...args.network, ...args.nft, owner: this.account.address });
    this.erc1155 = new ERC1155({ ...args.network, ...args.nft, owner: this.account.address });

    makeObservable(this, {
      nftType: observable,
      erc1155TransferAmount: observable,
      erc1155Balance: observable,
      isValidParams: computed,
      setTransferAmount: action,
    });

    this.checkNFT();
  }

  private async checkNFT() {
    const erc721Data = this.erc721.encodeOwnerOf(this.nft.tokenId);
    const erc1155Data = this.erc1155.encodeBalanceOf(this.account.address, this.nft.tokenId);

    const [erc721Owner, erc1155Balance] = await Promise.all([
      call<string>(this.network.chainId, { from: this.account.address, data: erc721Data, to: this.erc721.address }),
      call<string>(this.network.chainId, { from: this.account.address, data: erc1155Data, to: this.erc1155.address }),
    ]);

    if (
      utils.isAddress(erc721Owner?.substring(26) || '') &&
      utils.getAddress(erc721Owner!.substring(26)) === this.account.address
    ) {
      runInAction(() => {
        startLayoutAnimation();
        this.nftType = 'erc-721';
      });
    }

    try {
      if (BigInt(erc1155Balance || 0) > 0) {
        runInAction(() => {
          startLayoutAnimation();
          this.nftType = 'erc-1155';
          this.erc1155Balance = BigInt(erc1155Balance!);
        });
      }
    } catch (error) {}

    if (this.toAddress) {
      setTimeout(() => this.estimateGas(), 0);
    }
  }

  private estimatingTimer: any;
  setTransferAmount(amount: number) {
    this.erc1155TransferAmount = Math.max(1, Math.min(amount, Number(this.erc1155Balance)));
    this.isEstimatingGas = true;

    clearTimeout(this.estimatingTimer);
    this.estimatingTimer = setTimeout(() => this.estimateGas(), 1000);
  }

  increaseAmount() {
    this.setTransferAmount(this.erc1155TransferAmount + 1);
  }

  decreaseAmount() {
    this.setTransferAmount(this.erc1155TransferAmount - 1);
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

  sendTx(pin?: string) {
    return super.sendRawTx(
      {
        tx: this.txRequest,
        readableInfo: { type: 'transfer-nft', amount: this.erc1155TransferAmount, recipient: this.to, nft: this.nft.title },
      },
      pin
    );
  }

  dispose() {
    super.dispose();
    clearTimeout(this.estimatingTimer);
  }
}

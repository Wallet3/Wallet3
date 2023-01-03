import { BigNumber, providers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, eth_call } from '../../common/RPC';

import { Account } from '../account/Account';
import App from '../core/App';
import { BaseTransaction } from './BaseTransaction';
import { ERC1155Token } from '../../models/ERC1155';
import { ERC721Token } from '../../models/ERC721';
import { Gwei_1 } from '../../common/Constants';
import { INetwork } from '../../common/Networks';
import { showMessage } from 'react-native-flash-message';
import { startLayoutAnimation } from '../../utils/animations';

export interface NFTMetadata {
  id: string;
  tokenId: string;
  contract: string;
  title?: string;
  images: (string | undefined)[];
  types: (string | undefined)[];
  previews: (string | undefined)[];
  previewTypes: (string | undefined)[];
  description?: string;
  attributes?: { key: string; value: string }[];
}

interface IConstructor {
  nft: NFTMetadata;
  network: INetwork;
  account?: Account;
}

export class NFTTransferring extends BaseTransaction {
  readonly nft: NFTMetadata;
  readonly erc721: ERC721Token;
  readonly erc1155: ERC1155Token;

  nftStandard: 'erc-721' | 'erc-1155' | null = null;
  erc1155Balance = BigNumber.from(0);
  erc1155TransferAmount = 1;

  get isValidParams() {
    return (
      !this.loading &&
      this.nonce >= 0 &&
      this.isValidGas &&
      this.network &&
      this.nftStandard &&
      !this.insufficientFee &&
      !this.txException
    );
  }

  get txData() {
    return this.nftStandard === 'erc-721'
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
    this.erc721 = new ERC721Token({ ...args.network, ...args.nft, owner: this.account.address });
    this.erc1155 = new ERC1155Token({ ...args.network, ...args.nft, owner: this.account.address });

    makeObservable(this, {
      nftStandard: observable,
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

    const from = this.account.address;
    const [erc721Owner, erc1155Balance] = await Promise.all([
      eth_call<string>(this.network.chainId, { from, data: erc721Data, to: this.erc721.address }, true),
      eth_call<string>(this.network.chainId, { from, data: erc1155Data, to: this.erc1155.address }, true),
    ]);

    if (
      utils.isAddress(erc721Owner?.substring(26) || '') &&
      utils.getAddress(erc721Owner!.substring(26)) === this.account.address
    ) {
      runInAction(() => {
        startLayoutAnimation();
        this.nftStandard = 'erc-721';
      });
    }

    try {
      if (BigNumber.from(erc1155Balance || '0').gt(0)) {
        runInAction(() => {
          startLayoutAnimation();
          this.nftStandard = 'erc-1155';
          this.erc1155Balance = BigNumber.from(erc1155Balance!);
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
    if (!this.nftStandard) return;
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

  get txRequest(): providers.TransactionRequest | undefined {
    try {
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
    } catch (error) {
      showMessage((error as any).message);
    }
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

  get openseaLink() {
    return this.network.chainId === 1
      ? `https://opensea.io/assets/${this.nft.contract}/${this.nft.tokenId}`
      : `https://opensea.io/assets/${this.network.symbol.toLowerCase()}/${this.nft.contract}/${this.nft.tokenId}`;
  }

  get raribleLink() {
    const item = this.nft;

    return this.network.chainId === 1
      ? `https://rarible.com/token/${item.contract}:${item.tokenId}`
      : `https://rarible.com/token/${this.network.network.toLowerCase()}/${item.contract}:${item.tokenId}`;
  }
}

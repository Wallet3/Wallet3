import * as ethSignUtil from '@metamask/eth-sig-util';

import { BigNumber, BigNumberish, ContractReceipt, providers, utils } from 'ethers';
import { SignTxRequest, SignTypedDataRequest, WalletBase } from '../wallet/WalletBase';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { genColor, genEmoji } from '../../utils/emoji';

import { AccountTokens } from './content/AccountTokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthOptions } from '../auth/Authentication';
import CurrencyViewmodel from '../settings/Currency';
import { ENSViewer } from './content/ENSViewer';
import { IFungibleToken } from '../../models/Interfaces';
import { INetwork } from '../../common/Networks';
import { ITokenMetadata } from '../../common/tokens';
import { NFTViewer } from './content/NFTViewer';
import Networks from '../core/Networks';
import { POAP } from './content/POAP';
import { Paymaster } from '../services/erc4337/Paymaster';
import { ReadableInfo } from '../../models/entities/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { formatAddress } from '../../utils/formatter';
import { getEnsAvatar } from '../../common/ENS';
import { logEthSign } from '../services/Analytics';

export type AccountType = 'eoa' | 'erc4337';

export type SendTxRequest = Partial<{
  timestamp: number;
  tx: providers.TransactionRequest;
  txs: providers.TransactionRequest[];
  readableInfo: ReadableInfo;
  network: INetwork;
  gas: { maxFeePerGas: number; maxPriorityFeePerGas: number };
  paymaster?: Paymaster | null;
  onNetworkRequest?: () => void;
}>;

export type SendTxResponse = {
  success: boolean;
  txHash?: string;
  receiptPromise?: Promise<TransactionReceipt>;
  error?: { message: string; code: number };
  txHashPromise?: Promise<string>;
};

export abstract class AccountBase {
  protected wallet: WalletBase | null;

  abstract readonly type: AccountType;
  abstract readonly accountSubPath: string | undefined;
  readonly address: string;
  readonly index: number;
  readonly signInPlatform?: string;

  tokens: AccountTokens;
  ens: ENSViewer;
  nfts: NFTViewer;
  poap: POAP;
  emojiAvatar = '';
  emojiColor = '';
  nickname = '';

  get nativeToken() {
    return this.tokens.nativeToken;
  }

  get displayName() {
    return this.nickname || this.ens.name || formatAddress(this.address, 7, 5);
  }

  get miniDisplayName() {
    return this.nickname || this.ens.name || formatAddress(this.address, 6, 4, '...');
  }

  get avatar() {
    return this.ens.avatar;
  }

  get balance() {
    return CurrencyViewmodel.usdToToken(this.tokens.balanceUSD);
  }

  get isERC4337() {
    return this.type === 'erc4337';
  }

  get isEOA() {
    return this.type === 'eoa';
  }

  constructor(wallet: WalletBase, address: string, index: number, extra?: { signInPlatform?: string }) {
    this.wallet = wallet;
    this.address = address;
    this.index = index;
    this.signInPlatform = extra?.signInPlatform;

    this.tokens = new AccountTokens(this.address);
    this.ens = new ENSViewer(this.address);
    this.nfts = new NFTViewer(this.address);
    this.poap = new POAP(this.address);

    makeObservable(this, {
      tokens: observable,
      displayName: computed,
      balance: computed,
      emojiAvatar: observable,
      emojiColor: observable,
      nickname: observable,
      setAvatar: action,
    });

    AsyncStorage.getItem(`${address}-local-avatar`).then((v) => {
      let { emoji, color, nickname } = JSON.parse(v || '{}');

      if (!emoji || !color) {
        emoji = genEmoji();
        color = genColor();

        AsyncStorage.setItem(`${address}-local-avatar`, JSON.stringify({ emoji, color }));
      }

      runInAction(() => {
        this.emojiAvatar = emoji;
        this.emojiColor = color;
        this.nickname = nickname || '';
      });
    });
  }

  abstract getNonce(chainId: number): Promise<BigNumber>;
  abstract sendTx(args: SendTxRequest, pin?: string): Promise<SendTxResponse>;

  async signMessage(msg: string | Uint8Array, auth?: AuthOptions | undefined): Promise<string | undefined> {
    try {
      const wallet = await this.wallet?.openWallet({ accountIndex: this.index, subPath: this.accountSubPath, ...auth });
      return await wallet?.signMessage(typeof msg === 'string' && utils.isBytesLike(msg) ? utils.arrayify(msg) : msg);
    } catch (error) {
    } finally {
      logEthSign('plain');
    }
  }

  async signTypedData(request: SignTypedDataRequest & AuthOptions) {
    const wallet = await this.wallet?.openWallet({ ...request, accountIndex: this.index, subPath: this.accountSubPath });
    if (!wallet) return;

    try {
      return ethSignUtil.signTypedData({
        privateKey: Buffer.from(utils.arrayify(wallet.privateKey)),
        version: request.version ?? SignTypedDataVersion.V4,
        data: request.typedData,
      });
    } catch (error) {
    } finally {
      logEthSign('typed_data');
    }
  }

  setAvatar(objs: { emoji?: string; color?: string; nickname?: string }) {
    this.emojiAvatar = objs.emoji || this.emojiAvatar;
    this.emojiColor = objs.color || this.emojiColor;
    this.nickname = objs.nickname ?? this.nickname;

    AsyncStorage.setItem(
      `${this.address}-local-avatar`,
      JSON.stringify({ emoji: this.emojiAvatar, color: this.emojiColor, nickname: this.nickname })
    );
  }

  toPlainObject() {
    return {
      address: this.address,
      index: this.index,
    };
  }

  dispose() {
    this.wallet = null;
  }
}

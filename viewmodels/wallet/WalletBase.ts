import * as ethSignUtil from '@metamask/eth-sig-util';

import Authentication, { AuthOptions } from '../auth/Authentication';
import { Wallet as EthersWallet, providers, utils } from 'ethers';
import { PaymasterAPI, SimpleAccountAPI } from '@account-abstraction/sdk';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { logEthSign, logSendTx } from '../services/Analytics';

import { AccountBase } from '../account/AccountBase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseEntity } from 'typeorm';
import { EOA } from '../account/EOA';
import EventEmitter from 'eventemitter3';
import Key from '../../models/entities/Key';
import LINQ from 'linq';
import MetamaskDAppsHub from '../walletconnect/MetamaskDAppsHub';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { ReadableInfo } from '../../models/entities/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import TxHub from '../hubs/TxHub';
import { showMessage } from 'react-native-flash-message';

export type SignTxRequest = {
  accountIndex: number;
  tx: providers.TransactionRequest;
};

export type SendTxRequest = {
  tx: providers.TransactionRequest;
  txHex: string;
  readableInfo: ReadableInfo;
};

export type SignMessageRequest = {
  accountIndex: number;
  msg: string | Uint8Array;
  standardMode?: boolean;
};

export type SignTypedDataRequest = {
  accountIndex: number;
  typedData: any;
  version?: SignTypedDataVersion;
};

export function parseXpubkey(mixedKey: string) {
  const components = mixedKey.split(':');
  return components[components.length - 1];
}

export const WalletBaseKeys = {
  removedIndexes: (id: string | number) => `${id}-removed-indexes`,
  removedERC4337Indexes: (walletId: string | number) => `${walletId}-removed-erc4337-indexes`,
  addressCount: (walletId: string | number) => `${walletId}-address-count`,
  erc4437Count: (walletId: string | number) => `${walletId}-erc4437-count`,
  erc4437Accounts: (walletId: string | number) => `${walletId}-erc4437-accounts`,
};

interface Events {}

export abstract class WalletBase extends EventEmitter<Events> {
  protected removedEOAIndexes: number[] = [];
  protected removedERC4337Indexes: number[] = [];

  abstract isHDWallet: boolean;
  abstract isMultiSig: boolean;

  accounts: AccountBase[] = [];

  signInPlatform: 'apple' | 'google' | undefined;
  signInUser: string | undefined;

  get web2SignedIn() {
    return this.signInPlatform !== undefined;
  }

  protected abstract get key(): {
    bip32Xpubkey: string;
    id: string | number;
    basePathIndex: number;
    basePath: string;
  } & BaseEntity;

  get keyInfo() {
    return {
      id: this.key.id,
      basePathIndex: this.key.basePathIndex,
      basePath: this.key.basePath,
      bip32Xpubkey: this.key.bip32Xpubkey,
    };
  }

  constructor() {
    super();
    makeObservable(this, { accounts: observable, newEOA: action, removeAccount: action });
  }

  async init() {
    [this.removedEOAIndexes, this.removedERC4337Indexes] = (
      await Promise.all([
        AsyncStorage.getItem(WalletBaseKeys.removedIndexes(this.key.id)),
        AsyncStorage.getItem(WalletBaseKeys.removedERC4337Indexes(this.key.id)),
      ])
    ).map((v) => JSON.parse(v || '[]') as number[]);

    const count = Number((await AsyncStorage.getItem(WalletBaseKeys.addressCount(this.key.id))) || 1);
    const accounts: AccountBase[] = [];

    if (this.isHDWallet) {
      const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));

      for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
        if (this.removedEOAIndexes.includes(i)) continue;

        const accountNode = bip32.derivePath(`${i}`);
        accounts.push(new EOA(accountNode.address, i, { signInPlatform: this.signInPlatform }));
      }
    } else {
      accounts.push(new EOA(this.key.bip32Xpubkey, 0, { signInPlatform: '' }));
    }

    runInAction(() => (this.accounts = accounts));

    return this;
  }

  isSameKey(key: Key | MultiSigKey) {
    return (
      parseXpubkey(this.key.bip32Xpubkey) === parseXpubkey(key.bip32Xpubkey) &&
      this.key.basePath === key.basePath &&
      this.key.basePathIndex === key.basePathIndex
    );
  }

  newEOA(): EOA | undefined {
    if (!this.isHDWallet) return;

    const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));
    const eoas = this.accounts.filter((a) => a.type === 'eoa');

    const index =
      Math.max(
        eoas.length > 0 ? LINQ.from(eoas).max((a) => a.index) : 0,
        this.removedEOAIndexes.length > 0 ? LINQ.from(this.removedEOAIndexes).max() : 0
      ) + 1;

    const node = bip32.derivePath(`${index}`);
    const account = new EOA(node.address, index, { signInPlatform: this.signInPlatform });
    this.accounts.push(account);

    AsyncStorage.setItem(WalletBaseKeys.addressCount(this.key.id), `${index + 1}`);

    return account;
  }

  async newERC4337Account() {
    if (!this.isHDWallet && this.accounts.find((a) => a.type === 'erc4337')) return;

    const subPath = `4337'/`;

    const erc4337s = this.accounts.filter((a) => a.type === 'erc4337');
    const index =
      Math.max(
        erc4337s.length > 0 ? LINQ.from(erc4337s).max((a) => a.index) : 0,
        this.removedERC4337Indexes.length > 0 ? LINQ.from(this.removedERC4337Indexes).max() : 0
      ) + 1;

    const privateKey = await this.unlockPrivateKey(this.isHDWallet ? { subPath, accountIndex: index } : {});
    if (!privateKey) return;
  }

  async removeAccount(account: AccountBase) {
    const index = this.accounts.findIndex((a) => a.address === account.address);
    if (index === -1) return;

    this.removedEOAIndexes.push(account.index);
    this.accounts.splice(index, 1);

    const storeKey = WalletBaseKeys.removedIndexes(this.key.id);

    if (this.accounts.length > 0) {
      await AsyncStorage.setItem(storeKey, JSON.stringify(this.removedEOAIndexes));
    }

    MetamaskDAppsHub.removeAccount(account.address);
  }

  async signTx(args: SignTxRequest & AuthOptions) {
    try {
      const txHex = await (await this.openWallet(args))?.signTransaction(args.tx);
      return { txHex };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async signMessage(request: SignMessageRequest & AuthOptions) {
    try {
      if (utils.isBytes(request.msg) && !request.standardMode) {
        showMessage({ message: 'DANGEROUS: Wallet 3 rejects signing this data.', type: 'danger' });
        return undefined;
      } else {
        return (await this.openWallet(request))?.signMessage(
          typeof request.msg === 'string' && utils.isBytesLike(request.msg) ? utils.arrayify(request.msg) : request.msg
        );
      }
    } catch (error) {
      __DEV__ && console.log(error);
    } finally {
      logEthSign('plain');
    }
  }

  async signTypedData(request: SignTypedDataRequest & AuthOptions) {
    try {
      const key = await this.unlockPrivateKey(request);
      if (!key) return undefined;

      return ethSignUtil.signTypedData({
        privateKey: Buffer.from(utils.arrayify(key)),
        version: request.version ?? SignTypedDataVersion.V4,
        data: request.typedData,
      });
    } catch (error) {
      __DEV__ && console.error(error);
    } finally {
      logEthSign('typed_data');
    }
  }

  async sendTx(request: SendTxRequest) {
    const hash = await TxHub.broadcastTx({
      chainId: request.tx.chainId!,
      txHex: request.txHex,
      tx: { ...request.tx, readableInfo: request.readableInfo },
    });

    logSendTx(request);

    return hash;
  }

  async delete(): Promise<boolean> {
    AsyncStorage.removeItem(WalletBaseKeys.removedIndexes(this.key.id));
    AsyncStorage.removeItem(WalletBaseKeys.addressCount(this.key.id));
    await this.key.remove();
    return true;
  }

  abstract getSecret(pin?: string): Promise<string | undefined>;
  abstract dispose(): void;

  protected abstract unlockPrivateKey(
    args: {
      accountIndex?: number;
      subPath?: string;
    } & AuthOptions
  ): Promise<string | undefined>;

  private async openWallet(args: { accountIndex: number; subPath?: string } & AuthOptions) {
    const key = await this.unlockPrivateKey(args);
    if (!key) return undefined;

    return new EthersWallet(key);
  }
}

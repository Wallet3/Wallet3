import * as ethSignUtil from '@metamask/eth-sig-util';

import { Wallet as EthersWallet, providers, utils } from 'ethers';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { logEthSign, logSendTx } from '../services/Analytics';

import { Account } from '../account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from '../auth/Authentication';
import { BaseEntity } from 'typeorm';
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
  pin?: string;
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
  pin?: string;
};

export type SignTypedDataRequest = {
  accountIndex: number;
  typedData: any;
  pin?: string;
  version?: SignTypedDataVersion;
};

export function parseXpubkey(mixedKey: string) {
  const components = mixedKey.split(':');
  return components[components.length - 1];
}

export const WalletBaseKeys = {
  removedIndexes: (id: string | number) => `${id}-removed-indexes`,
  addressCount: (id: string | number) => `${id}-address-count`,
};

export abstract class WalletBase extends EventEmitter {
  protected removedAccountIndexes: number[] = [];

  abstract isHDWallet: boolean;
  abstract isMultiSig: boolean;

  accounts: Account[] = [];

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
    makeObservable(this, { accounts: observable, newAccount: action, removeAccount: action });
  }

  async init() {
    this.removedAccountIndexes = JSON.parse((await AsyncStorage.getItem(WalletBaseKeys.removedIndexes(this.key.id))) || '[]');

    const count = Number((await AsyncStorage.getItem(WalletBaseKeys.addressCount(this.key.id))) || 1);
    const accounts: Account[] = [];

    if (this.isHDWallet) {
      const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));

      for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
        if (this.removedAccountIndexes.includes(i)) continue;

        const accountNode = bip32.derivePath(`${i}`);
        accounts.push(new Account(accountNode.address, i, { signInPlatform: this.signInPlatform }));
      }
    } else {
      accounts.push(new Account(this.key.bip32Xpubkey, 0, { signInPlatform: '' }));
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

  newAccount(): Account | undefined {
    if (!this.isHDWallet) return;

    const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));
    const index =
      Math.max(
        this.accounts[this.accounts.length - 1].index,
        this.removedAccountIndexes.length > 0 ? LINQ.from(this.removedAccountIndexes).max() : 0
      ) + 1;

    const node = bip32.derivePath(`${index}`);
    const account = new Account(node.address, index, { signInPlatform: this.signInPlatform });
    this.accounts.push(account);

    AsyncStorage.setItem(WalletBaseKeys.addressCount(this.key.id), `${index + 1}`);

    return account;
  }

  async removeAccount(account: Account) {
    const index = this.accounts.findIndex((a) => a.address === account.address);
    if (index === -1) return;

    this.removedAccountIndexes.push(account.index);
    this.accounts.splice(index, 1);

    const storeKey = WalletBaseKeys.removedIndexes(this.key.id);

    if (this.accounts.length > 0) {
      await AsyncStorage.setItem(storeKey, JSON.stringify(this.removedAccountIndexes));
    } else {
      AsyncStorage.removeItem(storeKey);
    }

    MetamaskDAppsHub.removeAccount(account.address);
  }

  async signTx({ accountIndex, tx, pin }: SignTxRequest) {
    try {
      const txHex = await (await this.openWallet({ accountIndex, pin }))?.signTransaction(tx);
      return { txHex };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async signMessage(request: SignMessageRequest) {
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
      console.log(error);
    } finally {
      logEthSign('plain');
    }
  }

  async signTypedData(request: SignTypedDataRequest) {
    try {
      const key = await this.unlockPrivateKey(request);
      if (!key) return undefined;

      return ethSignUtil.signTypedData({
        privateKey: Buffer.from(utils.arrayify(key)),
        version: request.version ?? SignTypedDataVersion.V4,
        data: request.typedData,
      });
    } catch (error) {
      console.error(error);
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

  delete() {
    return this.key.remove();
  }

  abstract getSecret(pin?: string): Promise<string | undefined>;
  abstract dispose(): void;

  protected abstract unlockPrivateKey(args: { pin?: string; accountIndex?: number }): Promise<string | undefined>;

  private async openWallet(args: { pin?: string; accountIndex: number }) {
    const key = await this.unlockPrivateKey(args);
    if (!key) return undefined;

    return new EthersWallet(key);
  }
}

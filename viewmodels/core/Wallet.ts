import * as ethSignUtil from '@metamask/eth-sig-util';

import { Wallet as EthersWallet, providers, utils } from 'ethers';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from '../auth/Authentication';
import Key from '../../models/Key';
import LINQ from 'linq';
import MetamaskDAppsHub from '../walletconnect/MetamaskDAppsHub';
import { ReadableInfo } from '../../models/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import TxHub from '../hubs/TxHub';
import { logSendTx } from '../services/Analytics';
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

export class Wallet {
  private key: Key;
  private refreshTimer!: NodeJS.Timer;
  private removedIndexes: number[] = [];

  accounts: Account[] = [];

  lastRefreshedTime = 0;

  readonly isHDWallet: boolean;
  readonly signInPlatform: 'apple' | 'google' | undefined;
  readonly signInUser: string | undefined;

  get web2SignedIn() {
    return this.signInPlatform !== undefined;
  }

  constructor(key: Key) {
    this.key = key;

    const components = key.bip32Xpubkey.split(':');
    this.isHDWallet = components[components.length - 1].startsWith('xpub');
    this.signInPlatform = components.length > 1 ? (components[0] as any) : undefined;
    this.signInUser = components.length > 1 ? components[1] : undefined;

    makeObservable(this, {
      accounts: observable,
      newAccount: action,
      removeAccount: action,
    });
  }

  isSameKey(key: Key) {
    return (
      parseXpubkey(this.key.bip32Xpubkey) === parseXpubkey(key.bip32Xpubkey) &&
      this.key.basePath === key.basePath &&
      this.key.basePathIndex === key.basePathIndex
    );
  }

  async init() {
    this.removedIndexes = JSON.parse((await AsyncStorage.getItem(`${this.key.id}-removed-indexes`)) || '[]');
    const count = Number((await AsyncStorage.getItem(`${this.key.id}-address-count`)) || 1);
    const accounts: Account[] = [];

    if (this.isHDWallet) {
      const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));

      for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
        if (this.removedIndexes.includes(i)) continue;

        const accountNode = bip32.derivePath(`${i}`);
        accounts.push(new Account(accountNode.address, i, { signInPlatform: this.signInPlatform }));
      }
    } else {
      accounts.push(new Account(this.key.bip32Xpubkey, 0, { signInPlatform: '' }));
    }

    runInAction(() => (this.accounts = accounts));

    return this;
  }

  newAccount() {
    if (!this.isHDWallet) return;

    const bip32 = utils.HDNode.fromExtendedKey(parseXpubkey(this.key.bip32Xpubkey));
    const index =
      Math.max(
        this.accounts[this.accounts.length - 1].index,
        this.removedIndexes.length > 0 ? LINQ.from(this.removedIndexes).max() : 0
      ) + 1;

    const node = bip32.derivePath(`${index}`);
    const account = new Account(node.address, index, { signInPlatform: this.signInPlatform });
    this.accounts.push(account);

    AsyncStorage.setItem(`${this.key.id}-address-count`, `${index + 1}`);

    return account;
  }

  async removeAccount(account: Account) {
    const index = this.accounts.findIndex((a) => a.address === account.address);
    if (index === -1) return;

    this.removedIndexes.push(account.index);
    this.accounts.splice(index, 1);

    const storeKey = `${this.key.id}-removed-indexes`;

    if (this.accounts.length > 0) {
      await AsyncStorage.setItem(storeKey, JSON.stringify(this.removedIndexes));
    } else {
      AsyncStorage.removeItem(storeKey);
    }

    MetamaskDAppsHub.removeAccount(account.address);
  }

  private async unlockPrivateKey({ pin, accountIndex }: { pin?: string; accountIndex?: number }) {
    try {
      if (this.isHDWallet) {
        const xprivkey = await Authentication.decrypt(this.key.bip32Xprivkey, pin);
        if (!xprivkey) return undefined;

        const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
        const account = bip32.derivePath(`${accountIndex ?? 0}`);
        return account.privateKey;
      } else {
        const privkey = await Authentication.decrypt(this.key.secret, pin);
        return privkey;
      }
    } catch (error) {}
  }

  private async openWallet(args: { pin?: string; accountIndex: number }) {
    const key = await this.unlockPrivateKey(args);
    if (!key) return undefined;

    return new EthersWallet(key);
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
    } catch (error) {}
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

  async getSecret(pin?: string) {
    try {
      return await Authentication.decrypt(this.key.secret, pin);
    } catch (error) {}
  }

  dispose() {
    clearTimeout(this.refreshTimer);
  }

  delete() {
    return this.key.remove();
  }
}

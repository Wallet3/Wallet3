import * as ethSignUtil from '@metamask/eth-sig-util';

import { Bytes, Wallet as EthersWallet, providers, utils } from 'ethers';
import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';
import LINQ from 'linq';
import Networks from './Networks';
import { ReadableInfo } from '../models/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import TxHub from './hubs/TxHub';

type SignTxRequest = {
  accountIndex: number;
  tx: providers.TransactionRequest;
  pin?: string;
};

type SendTxRequest = {
  tx: providers.TransactionRequest;
  txHex: string;
  readableInfo: ReadableInfo;
};

type SignMessageRequest = {
  accountIndex: number;
  msg: string;
  pin?: string;
};

type SignTypedDataRequest = {
  accountIndex: number;
  typedData: any;
  pin?: string;
  version?: SignTypedDataVersion;
};

export class Wallet {
  private key: Key;
  private refreshTimer!: NodeJS.Timer;
  private removedIndexes: number[] = [];

  accounts: Account[] = [];

  lastRefreshedTime = 0;

  constructor(key: Key) {
    this.key = key;

    makeObservable(this, {
      accounts: observable,
      newAccount: action,
      removeAccount: action,
    });
  }

  isSameKey(key: Key) {
    return (
      this.key.bip32Xpubkey === key.bip32Xpubkey &&
      this.key.basePath === key.basePath &&
      this.key.basePathIndex === key.basePathIndex
    );
  }

  async init() {
    this.removedIndexes = JSON.parse((await AsyncStorage.getItem(`${this.key.id}-removed-indexes`)) || '[]');
    const count = Number((await AsyncStorage.getItem(`${this.key.id}-address-count`)) || 1);
    const bip32 = utils.HDNode.fromExtendedKey(this.key.bip32Xpubkey);

    const accounts: Account[] = [];

    for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
      if (this.removedIndexes.includes(i)) continue;

      const accountNode = bip32.derivePath(`${i}`);
      accounts.push(new Account(accountNode.address, i));
    }

    runInAction(() => (this.accounts = accounts));

    return this;
  }

  async newAccount() {
    const bip32 = utils.HDNode.fromExtendedKey(this.key.bip32Xpubkey);
    const index =
      Math.max(
        this.accounts[this.accounts.length - 1].index,
        this.removedIndexes.length > 0 ? LINQ.from(this.removedIndexes).max() : 0
      ) + 1;

    const node = bip32.derivePath(`${index}`);
    this.accounts.push(new Account(node.address, index));

    AsyncStorage.setItem(`${this.key.id}-address-count`, `${index + 1}`);
  }

  async removeAccount(account: Account) {
    const index = this.accounts.indexOf(account);
    if (index === -1) return;
    this.accounts.splice(index, 1);

    this.removedIndexes.push(account.index);
    await AsyncStorage.setItem(`${this.key.id}-removed-indexes`, JSON.stringify(this.removedIndexes));
  }

  private async unlockPrivateKey({ pin, accountIndex }: { pin?: string; accountIndex?: number }) {
    const xprivkey = await Authentication.decrypt(this.key.bip32Xprivkey, pin);
    if (!xprivkey) return undefined;

    const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
    const account = bip32.derivePath(`${accountIndex ?? 0}`);
    return account.privateKey;
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
      return (await this.openWallet(request))?.signMessage(request.msg);
    } catch (error) {}
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

    return hash;
  }

  async getSecret(pin?: string) {
    return await Authentication.decrypt(this.key.secret, pin);
  }

  dispose() {
    clearTimeout(this.refreshTimer);
  }
}

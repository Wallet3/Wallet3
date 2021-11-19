import * as ethSignUtil from '@metamask/eth-sig-util';

import { Wallet as EthersWallet, providers, utils } from 'ethers';
import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';
import Networks from './Networks';
import { ReadableInfo } from '../models/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import TxHub from './TxHub';

type SendTxRequest = {
  accountIndex: number;
  tx: providers.TransactionRequest;
  readableInfo: ReadableInfo;
  pin?: string;
};

type SignMessageRequest = {
  accountIndex?: number;
  msg: string;
  pin?: string;
};

type SignTypedDataRequest = {
  accountIndex?: number;
  typedData: any;
  pin?: string;
};

export class Wallet {
  private key: Key;
  private refreshTimer!: NodeJS.Timer;
  accounts: Account[] = [];
  currentAccount: Account | null = null;
  lastRefreshedTime = 0;

  constructor(key: Key) {
    this.key = key;

    makeObservable(this, {
      currentAccount: observable,
      accounts: observable,
      switchAccount: action,
    });

    reaction(
      () => Networks.current,
      () => {
        this.currentAccount?.refreshOverview();
      }
    );
  }

  async init() {
    const count = Number((await AsyncStorage.getItem('genAddressCount')) || 1);
    const bip32 = utils.HDNode.fromExtendedKey(this.key.bip32Xpubkey);

    const accounts: Account[] = [];

    for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
      const accountNode = bip32.derivePath(`${i}`);
      accounts.push(new Account(accountNode.address, i));
    }

    runInAction(() => {
      this.accounts = accounts;
      this.switchAccount(accounts[0]);
    });

    return this;
  }

  async refreshAccount() {
    if (Date.now() - this.lastRefreshedTime < 1000 * 5) return;
    this.lastRefreshedTime = Date.now();

    clearTimeout(this.refreshTimer);
    await this.currentAccount?.refreshTokensBalance();

    this.refreshTimer = setTimeout(() => this.refreshAccount(), 15 * 1000);
  }

  switchAccount(account: Account) {
    if (!account) return;
    this.currentAccount = account;
    this.currentAccount.refreshOverview();
    this.currentAccount.fetchBasicInfo();

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 60);
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

  async signTx({ accountIndex, tx, pin }: SendTxRequest) {
    try {
      return (await this.openWallet({ accountIndex, pin }))?.signTransaction(tx);
    } catch (error) {
      console.log(error);
    }
  }

  async signMessage(request: SignMessageRequest) {
    try {
      return (await this.openWallet({ accountIndex: this.currentAccount!.index, ...request }))?.signMessage(request.msg);
    } catch (error) {}
  }

  async signTypedData(request: SignTypedDataRequest) {
    try {
      const key = await this.unlockPrivateKey(request);
      if (!key) return undefined;

      return ethSignUtil.signTypedData({
        privateKey: Buffer.from(utils.arrayify(key)),
        version: SignTypedDataVersion.V4,
        data: request.typedData,
      });
    } catch (error) {}
  }

  async sendTx(request: SendTxRequest) {
    const txHex = await this.signTx(request);
    if (!txHex) return { success: false, error: 'Failed to sign transaction' };

    TxHub.broadcastTx({
      chainId: request.tx.chainId!,
      txHex,
      tx: { ...request.tx, readableInfo: request.readableInfo },
    });

    return { success: true, txHex };
  }

  async getSecret(pin?: string) {
    return await Authentication.decrypt(this.key.secret, pin);
  }
}

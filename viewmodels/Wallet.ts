import { Wallet as EthersWallet, providers, utils } from 'ethers';
import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';
import Networks from './Networks';
import TxHub from './TxHub';
import { sendTransaction } from '../common/RPC';

type SendTxRequest = {
  accountIndex: number;
  tx: providers.TransactionRequest;
  tokenInfo: { symbol: string; decimals: number; amountWei: string; recipient: string };
  pin?: string;
};

export class Wallet {
  private key: Key;
  private refreshTimer!: NodeJS.Timer;
  accounts: Account[] = [];
  currentAccount: Account | null = null;

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

  private async refreshAccount() {
    clearTimeout(this.refreshTimer);
    await this.currentAccount?.refreshTokensBalance();
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 30);
  }

  switchAccount(account: Account) {
    if (!account) return;
    this.currentAccount = account;
    this.currentAccount.refreshOverview();
    this.currentAccount.fetchBasicInfo();

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 30);
  }

  async signTx({ accountIndex, tx, pin }: SendTxRequest) {
    const xprivkey = await Authentication.decrypt(this.key.bip32Xprivkey, pin);
    if (!xprivkey) return undefined;

    const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
    const account = bip32.derivePath(`${accountIndex}`);
    return await new EthersWallet(account.privateKey).signTransaction(tx);
  }

  async sendTx(request: SendTxRequest) {
    const txHex = await this.signTx(request);
    if (!txHex) return false;

    TxHub.broadcastTx({ chainId: request.tx.chainId!, txHex, tx: { ...request.tx, ...request.tokenInfo } });

    return true;
  }
}

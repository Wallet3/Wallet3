import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { providers, utils } from 'ethers';

import { Account } from './account/Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Bookmarks from './customs/Bookmarks';
import Contacts from './customs/Contacts';
import Database from '../models/Database';
import GasPrice from './misc/GasPrice';
import Key from '../models/Key';
import LINQ from 'linq';
import LinkHub from './hubs/LinkHub';
import MessageKeys from '../common/MessageKeys';
import MetamaskDAppsHub from './walletconnect/MetamaskDAppsHub';
import Networks from './Networks';
import Theme from './settings/Theme';
import TxHub from './hubs/TxHub';
import UI from './settings/UI';
import { Wallet } from './Wallet';
import WalletConnectV1ClientHub from './walletconnect/WalletConnectV1ClientHub';
import { fetchChainsOverview } from '../common/apis/Debank';
import i18n from '../i18n';
import { showMessage } from 'react-native-flash-message';

export class AppVM {
  private lastRefreshedTime = 0;
  private refreshTimer!: NodeJS.Timer;

  initialized = false;
  wallets: Wallet[] = [];
  currentAccount: Account | null = null;

  get hasWallet() {
    return this.wallets.length > 0;
  }

  get allAccounts() {
    return LINQ.from(this.wallets.map((wallet) => wallet.accounts).flat())
      .distinct((a) => a.address)
      .toArray();
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      wallets: observable,
      hasWallet: computed,
      reset: action,
      switchAccount: action,
      currentAccount: observable,
      newAccount: action,
      removeAccount: action,
      allAccounts: computed,
    });

    reaction(
      () => Networks.current,
      () => {
        this.currentAccount?.tokens.refreshOverview();
        this.currentAccount?.nfts.refresh();
        this.allAccounts.forEach((a) => a.tokens.refreshNativeToken());
        UI.gasIndicator && GasPrice.refresh();
      }
    );
  }

  async addWallet(key: Key) {
    if (this.wallets.find((w) => w.isSameKey(key))) return;
    if (this.allAccounts.find((a) => a.address === key.bip32Xpubkey)) {
      this.switchAccount(key.bip32Xpubkey);
      return;
    }

    const wallet = await new Wallet(key).init();
    runInAction(() => {
      this.wallets.push(wallet);
      this.switchAccount(wallet.accounts[0].address);
    });
  }

  findWallet(accountAddress: string) {
    const wallet = this.wallets.find((w) => w.accounts.find((a) => a.address === accountAddress));
    if (!wallet) return;

    const account = wallet.accounts.find((a) => a.address === accountAddress);
    if (!account) return;

    return { wallet, accountIndex: account.index, account };
  }

  async sendTxFromAccount(account: string, opts: { tx: providers.TransactionRequest; pin?: string; readableInfo?: any }) {
    const { wallet, accountIndex } = this.findWallet(account) || {};
    if (!wallet) {
      showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
      return { error: { message: 'Invalid account', code: -32602 } };
    }

    const { txHex, error } = await wallet.signTx({
      ...opts,
      accountIndex: accountIndex!,
    });

    if (!txHex || error) {
      if (error) showMessage({ type: 'warning', message: error.message });
      return { error: { message: 'Signing tx failed', code: -32602 } };
    }

    const broadcastTx = {
      txHex,
      tx: opts.tx,
      readableInfo: opts.readableInfo,
    };

    wallet.sendTx(broadcastTx);

    return { txHash: utils.parseTransaction(txHex).hash || '', error: undefined };
  }

  findAccount(account: string) {
    return this.allAccounts.find((a) => a.address === account);
  }

  newAccount() {
    let { wallet } = this.findWallet(this.currentAccount!.address) || {};
    let account: Account | undefined;

    if (wallet?.isHDWallet) {
      account = wallet.newAccount();
    } else {
      wallet = this.wallets.find((w) => w.isHDWallet);
      account = wallet?.newAccount();
    }

    if (!account) {
      showMessage({ message: i18n.t('msg-no-hd-wallet'), type: 'warning' });
      return;
    }

    this.switchAccount(account.address);
  }

  switchAccount(address: string, force = false) {
    if (this.currentAccount?.address === address) return;

    let target = this.findAccount(address);
    if (!target && !force) return;

    target = target ?? this.allAccounts[0];
    if (!target) return;

    target.tokens.refreshOverview();
    target.nfts.refresh();
    target.poap.checkDefaultBadge();
    this.currentAccount = target;

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 20);
    AsyncStorage.setItem('lastUsedAccount', target.address);
  }

  async refreshAccount() {
    if (!Authentication.appAvailable) return;
    if (Date.now() - this.lastRefreshedTime < 1000 * 5) return;

    this.lastRefreshedTime = Date.now();

    clearTimeout(this.refreshTimer);
    await this.currentAccount?.tokens.refreshTokensBalance();

    this.refreshTimer = setTimeout(() => this.refreshAccount(), 12 * 1000);
  }

  async removeAccount(account: Account) {
    if (this.allAccounts.length === 1) return;

    const isCurrentAccount = account.address === this.currentAccount?.address;
    const index = this.allAccounts.indexOf(account);

    const { wallet } = this.findWallet(account.address) || {};
    if (!wallet) return;

    await wallet.removeAccount(account);

    if (isCurrentAccount) runInAction(() => this.switchAccount(this.allAccounts[Math.max(0, index - 1)].address));

    if (wallet.accounts.length === 0) {
      runInAction(() => this.wallets.splice(this.wallets.indexOf(wallet), 1));
      await wallet.delete();
    }
  }

  async init() {
    await Promise.all([Database.init(), Authentication.init()]);
    await Promise.all([Networks.init()]);

    TxHub.init();

    const wallets = await Promise.all((await Database.keys.find()).map((key) => new Wallet(key).init()));
    const lastUsedAccount = (await AsyncStorage.getItem('lastUsedAccount')) ?? '';
    if (utils.isAddress(lastUsedAccount)) fetchChainsOverview(lastUsedAccount);

    Authentication.once('appAuthorized', () => {
      WalletConnectV1ClientHub.init();
      MetamaskDAppsHub.init();
      LinkHub.start();
      Contacts.init();
    });

    PubSub.subscribe(MessageKeys.userSecretsNotVerified, () => {
      if ((this.currentAccount?.balance || 0) === 0) return;
      setTimeout(() => PubSub.publish(MessageKeys.openBackupSecretTip), 1000);
    });

    runInAction(() => {
      this.initialized = true;
      this.wallets = wallets;
      this.switchAccount(lastUsedAccount, true);
    });
  }

  async reset() {
    this.wallets.forEach((w) => w.dispose());
    this.wallets = [];
    this.currentAccount = null;

    PubSub.unsubscribe(MessageKeys.userSecretsNotVerified);

    TxHub.reset();
    Contacts.reset();
    Networks.reset();
    Bookmarks.reset();
    Theme.reset();
    UI.reset();

    await Promise.all([
      Database.reset(),
      AsyncStorage.clear(),
      Authentication.reset(),
      WalletConnectV1ClientHub.reset(),
      MetamaskDAppsHub.reset(),
    ]);
  }
}

export default new AppVM();

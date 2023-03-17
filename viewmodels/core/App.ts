import { AccountBase, AccountType } from '../account/AccountBase';
import { WalletBase, parseXpubkey } from '../wallet/WalletBase';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { providers, utils } from 'ethers';

import { AppState } from 'react-native';
import AppStoreReview from '../services/AppStoreReview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from '../auth/Authentication';
import Bookmarks from '../customs/Bookmarks';
import Contacts from '../customs/Contacts';
import Database from '../../models/Database';
import { ERC4337Account } from '../account/ERC4337Account';
import GasPrice from '../misc/GasPrice';
import Key from '../../models/entities/Key';
import KeyRecoveryWatcher from '../tss/management/KeyRecoveryDiscovery';
import KeySecurity from '../tss/management/KeySecurity';
import LINQ from 'linq';
import LinkHub from '../hubs/LinkHub';
import MetamaskDAppsHub from '../walletconnect/MetamaskDAppsHub';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../wallet/MultiSigWallet';
import Networks from './Networks';
import PairedDevices from '../tss/management/PairedDevices';
import { ReactNativeFirebase } from '@react-native-firebase/app';
import { SingleSigWallet } from '../wallet/SingleSigWallet';
import Theme from '../settings/Theme';
import TxHub from '../hubs/TxHub';
import UI from '../settings/UI';
import WalletConnectHub from '../walletconnect/WalletConnectHub';
import { fetchChainsOverview } from '../../common/apis/Debank';
import i18n from '../../i18n';
import { logAppReset } from '../services/Analytics';
import { showMessage } from 'react-native-flash-message';
import { tipWalletUpgrade } from '../misc/MultiSigUpgradeTip';

const Keys = {
  lastUsedAccount: 'lastUsedAccount',
};

export class AppVM {
  private lastRefreshedTime = 0;
  private refreshTimer!: NodeJS.Timer;

  firebaseApp!: ReactNativeFirebase.FirebaseApp;

  initialized = false;
  wallets: WalletBase[] = [];
  currentAccount: AccountBase | null = null;

  get hasWalletSet() {
    return this.wallets.length > 0 && Authentication.pinSet;
  }

  get hasWallet() {
    return this.wallets.length > 0;
  }

  get allAccounts() {
    return LINQ.from(this.wallets.flatMap((wallet) => wallet.accounts))
      .distinct((a) => a.address)
      .toArray();
  }

  get currentWallet() {
    return this.wallets.find((w) => w.accounts.find((a) => a.address === this.currentAccount?.address));
  }

  constructor() {
    makeObservable(this, {
      initialized: observable,
      wallets: observable,
      hasWalletSet: computed,
      hasWallet: computed,
      reset: action,
      switchAccount: action,
      currentAccount: observable,
      currentWallet: computed,
      newAccount: action,
      removeAccount: action,
      allAccounts: computed,
    });

    reaction(
      () => Networks.current,
      () => {
        this.currentAccount?.tokens.refreshOverview();
        this.currentAccount?.nfts.refresh();
        this.currentAccount?.isERC4337 && (this.currentAccount as ERC4337Account).checkActivated(Networks.current.chainId);
        this.allAccounts.forEach((a) => a.tokens.refreshNativeToken());
        UI.gasIndicator && GasPrice.refresh();
      }
    );

    reaction(
      () => this.currentWallet,
      () => KeySecurity.checkInactiveDevices(this.currentWallet)
    );

    AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      Authentication.appAuthorized && setTimeout(() => KeyRecoveryWatcher.scanLan(), 2000);
    });
  }

  async init() {
    await Promise.all([Database.init(), Authentication.init().catch()]);
    const [_, lastUsedAccount] = await Promise.all([Networks.init().catch(), AsyncStorage.getItem(Keys.lastUsedAccount)]);

    const wallets: WalletBase[] = LINQ.from(
      await Promise.all(
        [
          (await Database.multiSigKeys.find()).map((key) => new MultiSigWallet(key).init()),
          (await Database.keys.find()).map((key) => new SingleSigWallet(key).init()),
        ].flat()
      )
    )
      .where((i) => (i ? true : false))
      .distinct((w) => `${w.keyInfo.bip32Xpubkey}_${w.keyInfo.basePath}_${w.keyInfo.basePathIndex}`)
      .toArray();

    runInAction(() => {
      this.wallets = wallets;
      this.switchAccount(lastUsedAccount || '', true);
      this.initialized = true;
      this.allAccounts.filter((a) => a.isERC4337).map((a) => (a as ERC4337Account).checkActivated(Networks.current.chainId));
    });

    Authentication.once('appAuthorized', () => {
      WalletConnectHub.init();
      MetamaskDAppsHub.init();
      LinkHub.start();
      Contacts.init();

      TxHub.init().then(() => AppStoreReview.check());
      TxHub.on('txConfirmed', (tx) => {
        if (!(tx.from === this.currentAccount?.address && tx.chainId === Networks.current.chainId)) return;
        this.currentAccount.tokens.refreshNativeToken();
      });

      setTimeout(() => PairedDevices.scanLan(), 1000);
      Authentication.on('appAuthorized', () => setTimeout(() => PairedDevices.scanLan(), 1000));

      tipWalletUpgrade(this.currentWallet);
    });

    PairedDevices.init()
      .then(() => !this.hasWalletSet && KeyRecoveryWatcher.scanLan())
      .catch();

    lastUsedAccount && utils.isAddress(lastUsedAccount) && fetchChainsOverview(lastUsedAccount).catch();
  }

  async addWallet(key: Key | MultiSigKey) {
    if (this.wallets.find((w) => w.isSameKey(key))) return;
    if (this.allAccounts.find((a) => a.address === parseXpubkey(key.bip32Xpubkey))) {
      this.switchAccount(parseXpubkey(key.bip32Xpubkey));
      return;
    }

    const wallet = await (key instanceof Key ? new SingleSigWallet(key).init() : new MultiSigWallet(key).init());

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

  async sendTxFromAccount(address: string, opts: { tx: providers.TransactionRequest; pin?: string; readableInfo?: any }) {
    const account = this.findAccount(address);
    const { pin } = opts;

    return (await account?.sendTx(opts, pin)) ?? { error: { message: 'Invalid account', code: -32602 }, txHash: undefined };
  }

  findAccount(account: string) {
    return this.allAccounts.find((a) => a.address === account);
  }

  async newAccount(type: AccountType, onBusy?: (busy: boolean) => void) {
    let { wallet } = this.findWallet(this.currentAccount!.address) || {};
    !wallet?.isHDWallet && (wallet = this.wallets.find((w) => w.isHDWallet));

    const account = type === 'eoa' ? wallet?.newEOA() : await wallet?.newERC4337Account(onBusy);

    if (!account) {
      !wallet?.isHDWallet && showMessage({ message: i18n.t('msg-no-hd-wallet'), type: 'warning' });
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
    target.isERC4337 && (target as ERC4337Account).checkActivated(Networks.current.chainId);

    this.currentAccount = target;

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshAccount(), 1000 * 20);
    AsyncStorage.setItem(Keys.lastUsedAccount, target.address);
  }

  async refreshAccount() {
    if (!Authentication.appAvailable) return;
    if (Date.now() - this.lastRefreshedTime < 1000 * 5) return;

    this.lastRefreshedTime = Date.now();

    clearTimeout(this.refreshTimer);
    await this.currentAccount?.tokens.refreshTokensBalance();

    this.refreshTimer = setTimeout(() => this.refreshAccount(), 12 * 1000);
  }

  async removeAccount(account: AccountBase) {
    if (this.allAccounts.length === 1) return;

    const isCurrentAccount = account.address === this.currentAccount?.address;
    const index = this.allAccounts.indexOf(account);

    const { wallet } = this.findWallet(account.address) || {};
    if (!wallet) return;

    try {
      if (wallet.accounts.length > 1) {
        await wallet.removeAccount(account);
      } else {
        if (!(await this.removeWallet(wallet))) return;
      }

      if (isCurrentAccount) runInAction(() => this.switchAccount(this.allAccounts[Math.max(0, index - 1)].address));
    } finally {
      MetamaskDAppsHub.removeAccount(account.address);
    }
  }

  async removeWallet(wallet: WalletBase) {
    if (!(await wallet.delete())) return false;

    const index = this.wallets.indexOf(wallet);
    index >= 0 && runInAction(() => this.wallets.splice(index, 1));
    return true;
  }

  async reset() {
    this.wallets.forEach((w) => w.dispose());
    this.wallets = [];
    this.currentAccount = null;

    TxHub.reset();
    Contacts.reset();
    Networks.reset();
    Bookmarks.reset();
    Theme.reset();
    UI.reset();

    logAppReset();

    await Promise.all([
      Database.reset(),
      AsyncStorage.clear(),
      Authentication.reset(),
      WalletConnectHub.reset(),
      MetamaskDAppsHub.reset(),
    ]);
  }
}

export default new AppVM();

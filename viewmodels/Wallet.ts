import * as ethers from 'ethers';

import { action, makeObservable, observable, reaction, runInAction } from 'mobx';

import { Account } from './Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';
import Networks from './Networks';

export class Wallet {
  private key: Key;
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
    const bip32 = ethers.utils.HDNode.fromExtendedKey(this.key.bip32Xpubkey);

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

  switchAccount(account: Account) {
    if (!account) return;
    this.currentAccount = account;
    this.currentAccount.refreshOverview();
    this.currentAccount.fetchBasicInfo();
  }
}

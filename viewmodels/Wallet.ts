import * as ethers from 'ethers';

import { action, makeObservable, observable } from 'mobx';

import { Account } from './Account';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';

export class Wallet {
  private key: Key;
  currentAccount: Account | null = null;

  constructor(key: Key) {
    this.key = key;

    makeObservable(this, {
      currentAccount: observable,
      switchAccount: action,
    });
  }

  async init() {
    const count = Number((await AsyncStorage.getItem('genAddressCount')) || 1);
    const bip32 = ethers.utils.HDNode.fromExtendedKey(this.key.bip32Xpubkey);

    const accounts: Account[] = [];

    for (let i = this.key.basePathIndex; i < this.key.basePathIndex + count; i++) {
      const accountNode = bip32.derivePath(`${i}`);
      accounts.push(new Account(accountNode.address, i));
    }

    return this;
  }

  switchAccount(index: number) {}
}

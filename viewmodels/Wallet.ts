import * as ethers from 'ethers';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './Authentication';
import Key from '../models/Key';
import { makeObservable } from 'mobx';

export class Wallet {
  private key: Key;
  address = '';

  constructor(key: Key) {
    this.key = key;

    makeObservable(this, {});
  }

  async init() {
    const count = Number((await AsyncStorage.getItem('genAddressCount')) || 1);
    const xprivkey = await Authentication.decrypt(this.key.xprivkey);
    ethers.utils.HDNode.fromExtendedKey(xprivkey).derivePath('0').address;
    console.log();
  }
}

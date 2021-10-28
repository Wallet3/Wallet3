import * as Random from 'expo-random';
import * as ethers from 'ethers';

import { makeAutoObservable, makeObservable } from 'mobx';

import { WalletKey } from './WalletKey';

class MnemonicOnce {
  key = new WalletKey();
  secret = '';

  constructor() {
    makeAutoObservable(this);
  }

  generate(length: 12 | 24 = 12) {
    const entropy = Random.getRandomBytes(length === 12 ? 16 : 32);
    this.secret = ethers.utils.entropyToMnemonic(entropy);
    console.log(this.secret)
  }

  clean() {}
}

export default new MnemonicOnce();

import * as Random from 'expo-random';
import * as ethers from 'ethers';

import { makeAutoObservable, makeObservable, runInAction } from 'mobx';

import { WalletKey } from './WalletKey';

class MnemonicOnce {
  secret = '';
  derivationPath = `m/44'/60'/0'/0`;

  get secretWords() {
    return this.secret.split(' ');
  }

  constructor() {
    makeAutoObservable(this);
  }

  async generate(length: 12 | 24 = 12) {
    const entropy = Random.getRandomBytes(length === 12 ? 16 : 32);
    this.secret = ethers.utils.entropyToMnemonic(entropy);
  }

  save() {
    const root = ethers.utils.HDNode.fromMnemonic(this.secret);
    const main = root.derivePath(this.derivationPath);
    const xprivkey = main.extendedKey;
    ethers.utils.HDNode.fromExtendedKey(xprivkey).derivePath('0').address;

    const key = new WalletKey();
  }

  clean() {}
}

export default new MnemonicOnce();

import * as Random from 'expo-random';
import * as ethers from 'ethers';

import { makeAutoObservable, makeObservable, runInAction } from 'mobx';

import Authentication from './Authentication';
import Key from '../models/Key';
import { WalletKey } from './WalletKey';
import { encrypt } from '../utils/cipher';

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

  async save() {
    const root = ethers.utils.HDNode.fromMnemonic(this.secret);
    const main = root.derivePath(this.derivationPath);
    const xprivkey = main.extendedKey;
    ethers.utils.HDNode.fromExtendedKey(xprivkey).derivePath('0').address;

    let n = Date.now();
    const key = new Key();
    key.secret = encrypt(this.secret, await Authentication.getMasterKey());
    console.log(key.secret);
    console.log(Date.now() - n);
  }

  clean() {}
}

export default new MnemonicOnce();

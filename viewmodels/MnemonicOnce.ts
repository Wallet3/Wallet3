import * as Random from 'expo-random';
import * as ethers from 'ethers';

import { decrypt, encrypt } from '../utils/cipher';
import { makeAutoObservable, makeObservable, runInAction } from 'mobx';

import Authentication from './Authentication';
import { DEFAULT_DERIVATION_PATH } from '../common/Constants';
import Key from '../models/Key';
import { WalletKey } from './WalletKey';

class MnemonicOnce {
  secret = '';
  derivationPath = DEFAULT_DERIVATION_PATH;
  derivationIndex = 0;

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

    const key = new Key();
    key.secret = encrypt(this.secret, await Authentication.getMasterKey());
    key.xprvkey = encrypt(xprivkey, await Authentication.getMasterKey());
    key.basePath = this.derivationPath;
    key.basePathIndex = this.derivationIndex;

    await key.save();
  }

  clean() {}
}

export default new MnemonicOnce();

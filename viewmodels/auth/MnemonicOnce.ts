import * as Random from 'expo-random';
import * as ethers from 'ethers';

import Authentication from './Authentication';
import { DEFAULT_DERIVATION_PATH } from '../../common/Constants';
import Key from '../../models/Key';
import { makeAutoObservable } from 'mobx';
import { setStringAsync } from 'expo-clipboard';
import { xpubkeyFromHDNode } from '../../utils/bip32';

export class MnemonicOnce {
  secret = '';
  derivationPath = DEFAULT_DERIVATION_PATH;
  derivationIndex = 0;
  xpubPrefix = '';

  get secretWords() {
    return this.secret.split(/\s/);
  }

  constructor() {
    makeAutoObservable(this);
  }

  async generate(length: 12 | 24 = 12) {
    const entropy = Random.getRandomBytes(length === 12 ? 16 : 32);
    this.secret = ethers.utils.entropyToMnemonic(entropy);
    return this.secret;
  }

  setSecret(secret: string) {
    if (ethers.utils.isValidMnemonic(secret)) {
      this.secret = secret;
    } else if ((secret.length === 64 && !secret.startsWith('0x')) || (secret.startsWith('0x') && secret.length === 66)) {
      this.secret = secret;
    } else {
      this.secret = '';
    }

    const success = this.secret ? true : false;
    if (success) setStringAsync(''); // write empty string to clipboard, if the user pasted a mnemonic

    return success;
  }

  setXpubPrefix(prefix = '') {
    this.xpubPrefix = prefix;
  }

  async setDerivationPath(fullPath: string) {
    if (!fullPath.startsWith('m/')) return;
    const lastSlash = fullPath.lastIndexOf('/');
    this.derivationPath = fullPath.substring(0, lastSlash) || DEFAULT_DERIVATION_PATH;
    this.derivationIndex = Number.parseInt(fullPath.substring(lastSlash + 1)) || 0;
  }

  async save() {
    try {
      if (ethers.utils.isValidMnemonic(this.secret)) {
        return await this.saveMnemonic();
      }

      return await this.savePrivKey();
    } catch (error) {
      return undefined;
    } finally {
      this.clean();
    }
  }

  private async saveMnemonic() {
    const root = ethers.utils.HDNode.fromMnemonic(this.secret);

    const bip32 = root.derivePath(this.derivationPath);
    const bip32XPubkey = xpubkeyFromHDNode(bip32);

    const key = new Key();
    key.id = Date.now();
    key.secret = await Authentication.encrypt(this.secret);
    key.bip32Xprivkey = await Authentication.encrypt(bip32.extendedKey);
    key.bip32Xpubkey = this.xpubPrefix + bip32XPubkey;
    key.basePath = this.derivationPath;
    key.basePathIndex = this.derivationIndex;

    await key.save();
    return key;
  }

  private async savePrivKey() {
    const key = new Key();
    key.id = Date.now();
    key.secret = await Authentication.encrypt(this.secret);
    key.bip32Xpubkey = new ethers.Wallet(this.secret).address;

    await key.save();
    return key;
  }

  clean() {
    this.secret = '';
    this.xpubPrefix = '';
  }
}

export default new MnemonicOnce();

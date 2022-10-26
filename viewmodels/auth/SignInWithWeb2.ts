import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

import { DEFAULT_DERIVATION_PATH, SIGN_WEB2_SUB_PATH } from '../../common/Constants';
import { Wallet, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { decrypt, encrypt } from '../../utils/cipher';

import Authentication from './Authentication';
import MnemonicOnce from './MnemonicOnce';
import { Platform } from 'react-native';
import { hashMessage } from 'ethers/lib/utils';

const XpubPrefixes = {
  ios: 'apple',
  android: 'google',
};

const Keys = {
  recovery: (uid: string) => `${uid}_web2_recovery_key`,
  secret: (uid: string) => `${uid}_web2_secret`,
  xpubPrefix: (platform: string, uid: string) => `${platform}:${uid}:`,
};

export enum SignInType {
  newUser = 1,
  recover_key_exists,
  recover_key_not_exists,
}

export interface ISignInWithWeb2 {
  signIn(): SignInType;
}

export abstract class SignInWithWeb2 {
  isAvailable = false;
  loading = false;

  recoveryKey = '';
  uid = '';
  mini_uid = '';

  get recoveryKeyExists() {
    return this.recoveryKey.length === 64;
  }

  constructor() {
    makeObservable(this, {
      isAvailable: observable,
      loading: observable,
      recoveryKey: observable,
      recoveryKeyExists: computed,
    });
  }

  async getRecoverKey() {
    if (!(await Authentication.authorize())) return;
    return (await SecureStore.getItemAsync(Keys.recovery(this.mini_uid))) || '';
  }

  protected async setUser(user: string) {
    this.uid = utils.keccak256(utils.keccak256(Buffer.from(user, 'utf-8')));
    this.mini_uid = utils.keccak256(Buffer.from(user, 'utf-8')).substring(0, 10);
    MnemonicOnce.setUserPrefix(Keys.xpubPrefix(XpubPrefixes[Platform.OS] || '', this.mini_uid));

    const recoveryKey = (await SecureStore.getItemAsync(Keys.recovery(this.mini_uid))) || '';
    await runInAction(async () => (this.recoveryKey = recoveryKey));

    console.log('real key', recoveryKey);
  }

  protected async generate() {
    this.recoveryKey = Buffer.from(Random.getRandomBytes(32)).toString('hex');
    const plainSecret = await MnemonicOnce.generate(24);
    const encryptedSecret = encrypt(plainSecret, this.recoveryKey);

    await Promise.all([
      SecureStore.setItemAsync(Keys.recovery(this.mini_uid), this.recoveryKey),
      SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret),
    ]);

    const root = utils.HDNode.fromMnemonic(plainSecret);
    const bip32 = root.derivePath(DEFAULT_DERIVATION_PATH);

    console.log('meta:', this.uid, encryptedSecret);
    console.log('keccak256 hash', hashMessage(this.uid + encryptedSecret));

    const wallet = new Wallet(bip32.derivePath(SIGN_WEB2_SUB_PATH).privateKey);
    const signature = await wallet.signMessage(this.uid + encryptedSecret);
    console.log('signed:', wallet.address, signature);
  }

  async recover(key: string) {
    const encryptedSecret = await SecureStore.getItemAsync(Keys.secret(this.mini_uid));
    // TODO: get encrypted string from blockchain

    try {
      const success = MnemonicOnce.setSecret(decrypt(encryptedSecret!, key));
      if (!success) return false;

      await SecureStore.setItemAsync(Keys.recovery(this.mini_uid), key);
      await SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret!);
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  protected async checkUserRegistered() {
    const [recoveryKey, encryptedSecret] = await Promise.all([
      SecureStore.getItemAsync(Keys.recovery(this.mini_uid)),
      SecureStore.getItemAsync(Keys.secret(this.mini_uid)),
    ]);

    if (recoveryKey && encryptedSecret) {
      MnemonicOnce.setSecret(decrypt(encryptedSecret, recoveryKey));
      return true;
    }

    return false;
  }
}

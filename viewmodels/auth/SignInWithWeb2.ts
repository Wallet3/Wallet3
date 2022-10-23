import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

import { decrypt, encrypt } from '../../utils/cipher';
import { makeObservable, observable } from 'mobx';

import MnemonicOnce from './MnemonicOnce';
import { Platform } from 'react-native';
import { utils } from 'ethers';

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
    makeObservable(this, { isAvailable: observable, loading: observable });
  }

  protected setRecoveryKey(key: string) {
    this.recoveryKey = key;
  }

  protected async setUser(user: string) {
    this.uid = utils.keccak256(utils.keccak256(Buffer.from(user, 'utf-8')));
    this.mini_uid = utils.keccak256(Buffer.from(user, 'utf-8')).substring(0, 10);
    this.recoveryKey = (await SecureStore.getItemAsync(Keys.recovery(this.mini_uid))) || '';
    console.log(this.recoveryKey, utils.isBytesLike(this.recoveryKey), this.recoveryKey.length);
  }

  protected async generate() {
    MnemonicOnce.setXpubPrefix(Keys.xpubPrefix(XpubPrefixes[Platform.OS] || '', this.mini_uid));

    const plainSecret = await MnemonicOnce.generate(24);
    this.recoveryKey = Buffer.from(Random.getRandomBytes(32)).toString('hex');
    const encryptedSecret = encrypt(plainSecret, this.recoveryKey);

    await Promise.all([
      SecureStore.setItemAsync(Keys.recovery(this.mini_uid), this.recoveryKey),
      SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret),
    ]);

    // const root = utils.HDNode.fromMnemonic(this.plainSecret);
    // const bip32 = root.derivePath(DEFAULT_DERIVATION_PATH);
  }

  protected async recover() {}

  protected async isUserRegistered() {
    const [recoveryKey, encryptedSecret] = await Promise.all([
      SecureStore.getItemAsync(Keys.recovery(this.mini_uid)),
      SecureStore.getItemAsync(Keys.secret(this.mini_uid)),
    ]);

    if (recoveryKey && encryptedSecret) {
      const secret = decrypt(encryptedSecret, recoveryKey);
      MnemonicOnce.setXpubPrefix(Keys.xpubPrefix(XpubPrefixes[Platform.OS] || '', this.mini_uid));
      MnemonicOnce.setSecret(secret);
      return true;
    }

    return false;
  }
}

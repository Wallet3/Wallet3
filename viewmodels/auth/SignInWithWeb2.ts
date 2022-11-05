import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

import { computed, makeObservable, observable, runInAction } from 'mobx';
import { decrypt, encrypt } from '../../utils/cipher';

import Authentication from './Authentication';
import MnemonicOnce from './MnemonicOnce';
import { Platform } from 'react-native';
import { SignInWeb2Store } from './SignInWeb2Store';
import { utils } from 'ethers';

const XpubPrefixes = {
  ios: 'apple',
  android: 'google',
};

const Keys = {
  recovery: (uid: string) => `${uid}_web2_recovery_key`,
  // secret: (uid: string) => `${uid}_web2_secret`,
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
  private store!: SignInWeb2Store;

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

  abstract init(): void;
  abstract signIn(): Promise<SignInType | undefined>;
  abstract get platform(): string;

  async getRecoverKey(web2UID: string, pin?: string) {
    if (!(await Authentication.authorize(pin))) return '';
    return (await SecureStore.getItemAsync(Keys.recovery(web2UID))) || '';
  }

  protected async setUser(user: string) {
    if (!this.store) {
      this.store = new SignInWeb2Store();
      this.store.init();
    }

    this.uid = utils.keccak256(utils.keccak256(Buffer.from(user, 'utf-8')));
    this.mini_uid = utils.keccak256(Buffer.from(user, 'utf-8')).substring(0, 10);
    MnemonicOnce.setUserPrefix(Keys.xpubPrefix(XpubPrefixes[Platform.OS] || '', this.mini_uid));

    if (__DEV__) {
      await SecureStore.deleteItemAsync(Keys.recovery(this.mini_uid));
    }

    const recoveryKey = (await SecureStore.getItemAsync(Keys.recovery(this.mini_uid))) || '';
    await runInAction(async () => (this.recoveryKey = recoveryKey));
  }

  protected async generate() {
    this.recoveryKey = Buffer.from(Random.getRandomBytes(32)).toString('hex');
    const plainSecret = await MnemonicOnce.generate(24);
    const encryptedSecret = encrypt(plainSecret, this.recoveryKey);

    await Promise.all([
      SecureStore.setItemAsync(Keys.recovery(this.mini_uid), this.recoveryKey),
      // SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret),
    ]);

    // const root = utils.HDNode.fromMnemonic(plainSecret);
    // const bip32 = root.derivePath(DEFAULT_DERIVATION_PATH);

    // console.log('meta:', this.uid, encryptedSecret);
    // console.log('keccak256 hash', hashMessage(this.uid + encryptedSecret));

    // const wallet = new Wallet(bip32.derivePath(SIGN_WEB2_SUB_PATH).privateKey);
    // const signature = await wallet.signMessage(this.uid + encryptedSecret);

    await this.sync(encryptedSecret);
  }

  async recover(key: string) {
    if (!this.uid) return false;

    const encryptedSecret =
      // (await SecureStore.getItemAsync(Keys.secret(this.mini_uid))) ||
      (await this.store.get(this.uid))?.secret;

    try {
      const success = MnemonicOnce.setSecret(decrypt(encryptedSecret!, key));
      if (!success) return false;

      await SecureStore.setItemAsync(Keys.recovery(this.mini_uid), key);
      // await SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret!);
      return true;
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  protected async checkUserRegistered() {
    let [recoveryKey] = await Promise.all([
      SecureStore.getItemAsync(Keys.recovery(this.mini_uid)),
      // SecureStore.getItemAsync(Keys.secret(this.mini_uid)),
    ]);

    const cloud = await this.store.get(this.uid);
    const encryptedSecret = cloud?.secret;

    if (!encryptedSecret) return false;

    // if (recoveryKey && encryptedSecret && !cloud) {
    //   await this.sync();
    // }

    if (recoveryKey) {
      try {
        if (MnemonicOnce.setSecret(decrypt(encryptedSecret, recoveryKey))) {
          await runInAction(async () => (this.recoveryKey = recoveryKey!));
          // await SecureStore.setItemAsync(Keys.secret(this.mini_uid), encryptedSecret);
        } else {
          this.recoveryKey = '';
        }
      } catch (error) {
        console.log('decrypt error', error);
        this.recoveryKey = '';
      }
    }

    return true;
  }

  private async sync(secret: string) {
    // const secret = await SecureStore.getItemAsync(Keys.secret(this.mini_uid));
    if (!secret) return;

    await this.store.set({ uid: this.uid, secret, platform: this.platform });
  }

  async reset() {
    await Promise.all([
      SecureStore.deleteItemAsync(Keys.recovery(this.mini_uid)),
      // SecureStore.deleteItemAsync(Keys.secret(this.mini_uid)),
      this.store.delete(this.uid),
    ]);
  }
}

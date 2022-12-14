import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

import { computed, makeObservable, observable, runInAction } from 'mobx';
import { decode, encode, isValid as isBase64 } from 'js-base64';
import { decrypt, encrypt } from '../../utils/cipher';

import Authentication from './Authentication';
import MnemonicOnce from './MnemonicOnce';
import { SignInWeb2Store } from './SignInWeb2Store';
import { utils } from 'ethers';

const Keys = {
  recovery: (uid: string) => `${uid}_web2_recovery_key`,
  xpubPrefix: (platform: string, uid: string) => `${platform}:${uid}:`,
};

export enum SignInType {
  new_user = 1,
  recover_key_exists,
  recover_key_not_exists,
  failed,
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

  get encodedRecoveryKey() {
    return encode(this.recoveryKey);
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

  async getEncodedRecoverKey(web2UID: string, pin?: string) {
    if (!(await Authentication.authorize(pin))) return '';
    return encode((await SecureStore.getItemAsync(Keys.recovery(web2UID))) || '');
  }

  private async setUser(user: string) {
    if (!this.store) {
      this.store = new SignInWeb2Store();
    }

    this.uid = utils.keccak256(utils.keccak256(Buffer.from(user, 'utf-8')));
    this.mini_uid = utils.keccak256(Buffer.from(user, 'utf-8')).substring(0, 10);
    MnemonicOnce.setUserPrefix(Keys.xpubPrefix(this.platform, this.mini_uid));

    if (__DEV__) {
      await SecureStore.deleteItemAsync(Keys.recovery(this.mini_uid));
    }

    const recoveryKey = (await SecureStore.getItemAsync(Keys.recovery(this.mini_uid))) || '';
    await runInAction(async () => (this.recoveryKey = recoveryKey));
  }

  protected async generate() {
    this.recoveryKey = Buffer.from(Random.getRandomBytes(32)).toString('hex');
    await SecureStore.setItemAsync(Keys.recovery(this.mini_uid), this.recoveryKey);

    const plainSecret = await MnemonicOnce.generate(24);
    const encryptedSecret = encrypt(plainSecret, this.recoveryKey);

    // const root = utils.HDNode.fromMnemonic(plainSecret);
    // const bip32 = root.derivePath(DEFAULT_DERIVATION_PATH);

    // console.log('meta:', this.uid, encryptedSecret);
    // console.log('keccak256 hash', hashMessage(this.uid + encryptedSecret));

    // const wallet = new Wallet(bip32.derivePath(SIGN_WEB2_SUB_PATH).privateKey);
    // const signature = await wallet.signMessage(this.uid + encryptedSecret);

    if (!(await this.store.set({ uid: this.uid, secret: encryptedSecret, platform: this.platform }))) {
      MnemonicOnce.clean();
      return false;
    }

    return true;
  }

  async recover(key: string) {
    if (!this.uid) return false;
    if (key.length > 82 && isBase64(key)) {
      key = decode(key);
    }

    const encryptedSecret = (await this.store.get(this.uid))?.secret;

    try {
      const success = MnemonicOnce.setSecret(decrypt(encryptedSecret!, key));
      if (!success) return false;

      await SecureStore.setItemAsync(Keys.recovery(this.mini_uid), key);
      return true;
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  private async checkUserRegistered() {
    const cloud = await this.store.get(this.uid);
    const encryptedSecret = cloud?.secret;

    if (!encryptedSecret) return false;

    const recoveryKey = await SecureStore.getItemAsync(Keys.recovery(this.mini_uid));

    if (recoveryKey) {
      try {
        if (MnemonicOnce.setSecret(decrypt(encryptedSecret, recoveryKey))) {
          await runInAction(async () => (this.recoveryKey = recoveryKey!));
        } else {
          this.recoveryKey = '';
        }
      } catch (error) {
        this.recoveryKey = '';
      }
    }

    return true;
  }

  async autoRegister(user: string) {
    await this.setUser(user);

    const isRegistered = await this.checkUserRegistered();
    if (!isRegistered) {
      return (await this.generate()) ? SignInType.new_user : SignInType.failed;
    }

    return this.recoveryKeyExists ? SignInType.recover_key_exists : SignInType.recover_key_not_exists;
  }

  async reset() {
    await Promise.all([SecureStore.deleteItemAsync(Keys.recovery(this.mini_uid)), this.store.delete(this.uid)]);
  }
}

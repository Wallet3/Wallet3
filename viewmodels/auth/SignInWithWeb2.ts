import * as Random from 'expo-random';

import { makeObservable, observable } from 'mobx';

import MnemonicOnce from './MnemonicOnce';
import { Platform } from 'react-native';
import { encrypt } from '../../utils/cipher';
import { utils } from 'ethers';

const XpubPrefixes = {
  ios: 'apple',
  android: 'google',
};

export enum SignInType {
  newUser = 1,
  recovery,
}

export interface ISignInWithWeb2 {
  signIn(): SignInType;
}

export abstract class SignInWithWeb2 {
  isAvailable = false;
  loading = false;
  recoveryKey = '';
  user = '';

  uid = '';
  plainSecret = '';
  encryptedSecret = '';

  constructor() {
    makeObservable(this, { isAvailable: observable, loading: observable, recoveryKey: observable });
  }

  protected setRecoveryKey(key: string) {
    this.recoveryKey = key;
  }

  protected setUser(user: string) {
    this.user = user;
    this.uid = utils.keccak256(utils.keccak256(Buffer.from(user, 'utf-8')));
  }

  protected async generate() {
    MnemonicOnce.setXpubPrefix(`${XpubPrefixes[Platform.OS] || ''}:`);
    this.plainSecret = await MnemonicOnce.generate(24);
    this.recoveryKey = Buffer.from(Random.getRandomBytes(32)).toString('hex');

    console.log(encrypt(this.plainSecret, this.recoveryKey));
    // const root = utils.HDNode.fromMnemonic(this.plainSecret);
    // const bip32 = root.derivePath(DEFAULT_DERIVATION_PATH);
  }

  protected async recover() {}

  protected async isUserRegistered() {
    return false;
  }
}

import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';

import {
  AuthenticationType,
  LocalAuthenticationOptions,
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { appEncryptKey, pinEncryptKey } from '../configs/secret';
import { decrypt, encrypt, sha256 } from '../utils/cipher';

import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = {
  enableBiometrics: 'enableBiometrics',
  masterKey: 'masterKey',
  pin: 'pin',
};

class Authentication {
  biometricsSupported = false;
  supportedTypes: AuthenticationType[] = [];
  biometricsEnabled = true;

  appAuthorized = false;

  constructor() {
    makeObservable(this, {
      biometricsSupported: observable,
      supportedTypes: observable,
      biometricsEnabled: observable,
      appAuthorized: observable,
      setBiometrics: action,
    });

    this.init();
  }

  async init() {
    const [supported, enrolled, supportedTypes, enableBiometrics, masterKey] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
      supportedAuthenticationTypesAsync(),
      AsyncStorage.getItem(keys.enableBiometrics),
      SecureStore.getItemAsync(keys.masterKey),
    ]);

    if (!masterKey) {
      SecureStore.setItemAsync(keys.masterKey, Buffer.from(Random.getRandomBytes(8)).toString('hex'));
    }

    runInAction(() => {
      this.biometricsSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
      this.biometricsEnabled = enableBiometrics ? enableBiometrics === 'true' : true;
    });
  }

  private async authenticate({ pin, options }: { pin?: string; options?: LocalAuthenticationOptions } = {}): Promise<boolean> {
    if (pin) return await this.verifyPin(pin);
    if (!this.biometricsSupported) return false;

    const { success } = await authenticateAsync(options);
    return success;
  }

  private async getMasterKey() {
    return `${await SecureStore.getItemAsync(keys.masterKey)}_${appEncryptKey}`;
  }

  setBiometrics(enabled: boolean) {
    this.biometricsEnabled = enabled;
    AsyncStorage.setItem(keys.enableBiometrics, enabled.toString());
  }

  async setupPin(pin: string) {
    await SecureStore.setItemAsync(keys.pin, await sha256(`${pin}_${pinEncryptKey}`));
  }

  async verifyPin(pin: string) {
    return (await sha256(`${pin}_${pinEncryptKey}`)) === (await SecureStore.getItemAsync(keys.pin));
  }

  async authorize(pin?: string) {
    const success = await this.authenticate({ pin });
    runInAction(() => (this.appAuthorized = success));
    return success;
  }

  async encrypt(data: string) {
    return encrypt(data, await this.getMasterKey());
  }

  async decrypt(data: string, pin?: string) {
    if (!(await this.authenticate({ pin }))) return undefined;
    return decrypt(data, await this.getMasterKey());
  }
}

export default new Authentication();

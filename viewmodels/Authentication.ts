import * as Random from 'expo-random';
import * as ScreenCapture from 'expo-screen-capture';
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

import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'events';

const keys = {
  enableBiometrics: 'enableBiometrics',
  userSecretsVerified: 'userSecretsVerified',
  masterKey: 'masterKey',
  pin: 'pin',
};

export class Authentication extends EventEmitter {
  private lastBackgroundTimestamp = Date.now();

  biometricsSupported = false;
  supportedTypes: AuthenticationType[] = [];
  biometricEnabled = true;

  appAuthorized = false;
  userSecretsVerified = false;

  get biometricType() {
    if (!this.biometricsSupported || !this.biometricEnabled) return undefined;

    switch (this.supportedTypes[0]) {
      case AuthenticationType.FINGERPRINT:
        return 'fingerprint';
      case AuthenticationType.FACIAL_RECOGNITION:
        return 'faceid';
    }

    return undefined;
  }

  constructor() {
    super();

    makeObservable(this, {
      biometricsSupported: observable,
      supportedTypes: observable,
      biometricEnabled: observable,
      appAuthorized: observable,
      userSecretsVerified: observable,
      setBiometrics: action,
      reset: action,
    });

    this.init();

    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        this.lastBackgroundTimestamp = Date.now();
        return;
      }

      if (nextState === 'active') {
        if (Date.now() - this.lastBackgroundTimestamp < 1000 * 60) return;
        runInAction(() => (this.appAuthorized = false));
      }
    });
  }

  async init() {
    const [supported, enrolled, supportedTypes, enableBiometrics, masterKey, userSecretsVerified] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
      supportedAuthenticationTypesAsync(),
      AsyncStorage.getItem(keys.enableBiometrics),
      SecureStore.getItemAsync(keys.masterKey),
      AsyncStorage.getItem(keys.userSecretsVerified),
    ]);

    if (!masterKey) {
      SecureStore.setItemAsync(keys.masterKey, Buffer.from(Random.getRandomBytes(16)).toString('hex'));
    }

    runInAction(() => {
      this.biometricsSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
      this.biometricEnabled = enableBiometrics === 'true';
      this.userSecretsVerified = userSecretsVerified === 'true';
    });

    ScreenCapture.preventScreenCaptureAsync();
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

  async setBiometrics(enabled: boolean) {
    if (enabled) {
      if (!(await this.authenticate())) return;
    }

    runInAction(() => (this.biometricEnabled = enabled));
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
    if (!this.appAuthorized) {
      runInAction(() => (this.appAuthorized = success));
      if (success) this.emit('appAuthorized');
    }
    return success;
  }

  async encrypt(data: string) {
    return encrypt(data, await this.getMasterKey());
  }

  async decrypt(data: string, pin?: string) {
    if (!(await this.authenticate({ pin }))) return undefined;
    return decrypt(data, await this.getMasterKey());
  }

  setUserSecretsVerified(verified: boolean) {
    this.userSecretsVerified = verified;
    AsyncStorage.setItem(keys.userSecretsVerified, verified.toString());
  }

  reset() {
    this.appAuthorized = false;
    this.userSecretsVerified = false;
    this.biometricEnabled = false;
    SecureStore.setItemAsync(keys.masterKey, Buffer.from(Random.getRandomBytes(16)).toString('hex'));
  }
}

export default new Authentication();

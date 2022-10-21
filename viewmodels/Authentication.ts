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
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { appEncryptKey, pinEncryptKey } from '../configs/secret';
import { decrypt, encrypt, sha256 } from '../utils/cipher';

import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'events';
import MessageKeys from '../common/MessageKeys';
import { toMilliseconds } from '../utils/time';

const keys = {
  enableBiometrics: 'enableBiometrics',
  userSecretsVerified: 'userSecretsVerified',
  masterKey: 'masterKey',
  pin: 'pin',
  lockAppTo: 'lockAppTo',
};

export type BioType = 'faceid' | 'fingerprint' | 'iris';

export class Authentication extends EventEmitter {
  private lastBackgroundTimestamp = Date.now();

  biometricSupported = false;
  supportedTypes: AuthenticationType[] = [];
  biometricEnabled = true;

  appAuthorized = false;
  userSecretsVerified = false;

  failedAttempts = 0;
  lockAppTo = 0;

  get appAvailable() {
    return Date.now() > this.lockAppTo;
  }

  get biometricType(): BioType | undefined {
    if (!this.biometricSupported || !this.biometricEnabled) return undefined;

    switch (this.supportedTypes[0]) {
      case AuthenticationType.FINGERPRINT:
        return 'fingerprint';
      case AuthenticationType.FACIAL_RECOGNITION:
        return 'faceid';
      case AuthenticationType.IRIS:
        return 'iris';
      default:
        return undefined;
    }
  }

  constructor() {
    super();

    makeObservable(this, {
      biometricSupported: observable,
      supportedTypes: observable,
      biometricEnabled: observable,
      appAuthorized: observable,
      userSecretsVerified: observable,
      failedAttempts: observable,
      lockAppTo: observable,
      appAvailable: computed,
      setBiometrics: action,
      reset: action,
      setUserSecretsVerified: action,
    });

    this.init();

    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        this.lastBackgroundTimestamp = Date.now();
        return;
      }

      if (nextState === 'active') {
        if (Date.now() - this.lastBackgroundTimestamp < 1000 * 60 * 2) return;
        runInAction(() => (this.appAuthorized = false));
      }
    });
  }

  async init() {
    const [supported, enrolled, supportedTypes, enableBiometrics, masterKey, userSecretsVerified, lockAppDuration] =
      await Promise.all([
        hasHardwareAsync(),
        isEnrolledAsync(),
        supportedAuthenticationTypesAsync(),
        AsyncStorage.getItem(keys.enableBiometrics),
        SecureStore.getItemAsync(keys.masterKey),
        AsyncStorage.getItem(keys.userSecretsVerified),
        AsyncStorage.getItem(keys.lockAppTo),
      ]);

    if (!masterKey) {
      SecureStore.setItemAsync(keys.masterKey, Buffer.from(Random.getRandomBytes(16)).toString('hex'));
    }

    runInAction(() => {
      this.biometricSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
      this.biometricEnabled = enableBiometrics === 'true';
      this.userSecretsVerified = userSecretsVerified === 'true';
      this.lockAppTo = Number(lockAppDuration) || 0;
    });
  }

  private async authenticate({ pin, options }: { pin?: string; options?: LocalAuthenticationOptions } = {}): Promise<boolean> {
    if (pin) return await this.verifyPin(pin);
    if (!this.biometricSupported) return false;

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

      if (success) {
        this.emit('appAuthorized');
        if (!this.userSecretsVerified) PubSub.publish(MessageKeys.userSecretsNotVerified);
      }
    }

    runInAction(() => {
      this.failedAttempts = success ? 0 : this.failedAttempts + 1;
      if (this.failedAttempts < 10) return;

      this.lockAppTo = Date.now() + toMilliseconds({ hours: 10 });
      AsyncStorage.setItem(keys.lockAppTo, this.lockAppTo.toString());
    });

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
    return SecureStore.setItemAsync(keys.masterKey, Buffer.from(Random.getRandomBytes(16)).toString('hex'));
  }
}

export default new Authentication();

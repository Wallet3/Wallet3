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
import { appEncryptKey, pinEncryptKey } from '../../configs/secret';
import { decrypt, encrypt, sha256 } from '../../utils/cipher';

import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'eventemitter3';
import { getSecureRandomBytes } from '../../utils/math';
import { logWalletLocked } from '../services/Analytics';
import { toMilliseconds } from '../../utils/time';

const Keys = {
  enableBiometrics: 'enableBiometrics',
  masterKey: 'masterKey',
  foreverKey: 'foreverKey',
  pin: 'pin',
  appUnlockTime: 'appUnlockTime',
};

export type BioType = 'faceid' | 'fingerprint' | 'iris';

interface Events {
  appAuthorized: () => void;
}

export class Authentication extends EventEmitter<Events> {
  private lastBackgroundTimestamp = Date.now();

  biometricSupported = false;
  supportedTypes: AuthenticationType[] = [];
  biometricEnabled = true;
  pinSet = false;

  appAuthorized = false;

  failedAttempts = 0;
  appUnlockTime = 0;

  get appAvailable() {
    return Date.now() > this.appUnlockTime;
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
      failedAttempts: observable,
      appUnlockTime: observable,
      pinSet: observable,
      appAvailable: computed,

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
        if (Date.now() - this.lastBackgroundTimestamp < (__DEV__ ? 20 : 60 * 2) * 1000) return;
        if (!this.appAuthorized) return;

        runInAction(() => {
          this.appAuthorized = false;
          this.failedAttempts = 0;
        });
      }
    });
  }

  async init() {
    const [supported, enrolled, supportedTypes, enableBiometrics, appUnlockTime, pinCode] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
      supportedAuthenticationTypesAsync(),
      AsyncStorage.getItem(Keys.enableBiometrics),
      AsyncStorage.getItem(Keys.appUnlockTime),
      SecureStore.getItemAsync(Keys.pin),
    ]);

    runInAction(() => {
      this.biometricSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
      this.biometricEnabled = enableBiometrics === 'true';
      this.appUnlockTime = Number(appUnlockTime) || 0;
      this.pinSet = pinCode ? true : false;
    });
  }

  private async authenticate({ pin, options }: { pin?: string; options?: LocalAuthenticationOptions } = {}): Promise<boolean> {
    if (pin) return await this.verifyPin(pin);
    if (!this.biometricSupported) return false;

    const { success } = await authenticateAsync(options);
    return success;
  }

  private async getMasterKey() {
    let masterKey = await SecureStore.getItemAsync(Keys.masterKey);

    if (!masterKey) {
      masterKey = Buffer.from(getSecureRandomBytes(16)).toString('hex');
      await SecureStore.setItemAsync(Keys.masterKey, masterKey);
    }

    return `${masterKey}_${appEncryptKey}`;
  }

  private async getForeverKey() {
    let foreverKey = await SecureStore.getItemAsync(Keys.foreverKey);

    if (!foreverKey) {
      foreverKey = Buffer.from(getSecureRandomBytes(16)).toString('hex');
      await SecureStore.setItemAsync(Keys.foreverKey, foreverKey);
    }

    return foreverKey;
  }

  async setBiometrics(enabled: boolean) {
    if (enabled) {
      if (!(await this.authenticate())) return;
    }

    runInAction(() => (this.biometricEnabled = enabled));
    AsyncStorage.setItem(Keys.enableBiometrics, enabled.toString());
  }

  async setupPin(pin: string) {
    await SecureStore.setItemAsync(Keys.pin, await sha256(`${pin}_${pinEncryptKey}`));
  }

  verifyPin = async (pin: string) => {
    const success = (await sha256(`${pin}_${pinEncryptKey}`)) === (await SecureStore.getItemAsync(Keys.pin));

    runInAction(() => {
      this.failedAttempts = success ? 0 : this.failedAttempts + 1;
      if (this.failedAttempts <= (__DEV__ ? 2 : 6)) return;

      this.failedAttempts = 0;
      this.appUnlockTime = Date.now() + (__DEV__ ? toMilliseconds({ seconds: 20 }) : toMilliseconds({ hours: 3 }));
      AsyncStorage.setItem(Keys.appUnlockTime, this.appUnlockTime.toString());
      logWalletLocked();
    });

    return success;
  };

  authorize = async (pin?: string) => {
    const success = await this.authenticate({ pin });

    if (!this.appAuthorized) {
      runInAction(() => (this.appAuthorized = success));
      success && this.emit('appAuthorized');
    }

    return success;
  };

  encrypt = async (data: string) => {
    return encrypt(data, await this.getMasterKey());
  };

  decrypt = async <T = string | string[]>(data: T, pin?: string): Promise<T | undefined> => {
    if (!(await this.authenticate({ pin }))) return undefined;

    const masterKey = await this.getMasterKey();

    if (Array.isArray(data)) {
      return data.map((d) => (d ? decrypt(d, masterKey) : d)) as T;
    } else {
      return decrypt(data as string, masterKey) as T;
    }
  };

  encryptForever = async (data: string) => {
    return encrypt(data, await this.getForeverKey());
  };

  decryptForever = async <T = string | string[]>(data: T, pin?: string): Promise<T | undefined> => {
    if (!(await this.authenticate({ pin }))) return undefined;

    const foreverKey = await this.getForeverKey();

    if (Array.isArray(data)) {
      return data.map((d) => (d ? decrypt(d, foreverKey) : d)) as T;
    } else {
      return decrypt(data as string, foreverKey) as T;
    }
  };

  reset() {
    this.appAuthorized = false;
    this.biometricEnabled = false;
    this.removeAllListeners();
    return Promise.all([SecureStore.deleteItemAsync(Keys.masterKey), SecureStore.deleteItemAsync(Keys.pin)]);
  }
}

export default new Authentication();

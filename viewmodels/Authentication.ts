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

import AsyncStorage from '@react-native-async-storage/async-storage';

class Authentication {
  biometricsSupported = false;
  supportedTypes: AuthenticationType[] = [];
  biometricsEnabled = true;

  constructor() {
    makeObservable(this, {
      biometricsSupported: observable,
      supportedTypes: observable,
      biometricsEnabled: observable,
      setBiometrics: action,
    });

    this.init();
  }

  async init() {
    const [supported, enrolled, supportedTypes, enableBiometrics] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
      supportedAuthenticationTypesAsync(),
      AsyncStorage.getItem('enableBiometrics'),
    ]);

    runInAction(() => {
      this.biometricsSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
      this.biometricsEnabled = enableBiometrics ? enableBiometrics === 'true' : true;
    });
  }

  async authenticate({ pin, options }: { pin?: string; options?: LocalAuthenticationOptions } = {}) {
    if (pin) return pin === (await SecureStore.getItemAsync('pin'));

    const { success } = await authenticateAsync(options);
    return success;
  }

  setBiometrics(enabled: boolean) {
    this.biometricsEnabled = enabled;
    AsyncStorage.setItem('enableBiometrics', enabled.toString());
  }

  async setupPin(pin: string) {
    await SecureStore.setItemAsync('pin', pin);
  }
}

export default new Authentication();

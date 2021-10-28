import * as SecureStore from 'expo-secure-store';

import {
  AuthenticationType,
  LocalAuthenticationOptions,
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';
import { makeObservable, observable, runInAction } from 'mobx';

class Authentication {
  biometricsSupported = false;
  supportedTypes: AuthenticationType[] = [];

  constructor() {
    makeObservable(this, {
      biometricsSupported: observable,
      supportedTypes: observable,
    });

    this.init();
  }

  async init() {
    const [supported, enrolled, supportedTypes] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
      supportedAuthenticationTypesAsync(),
    ]);

    runInAction(() => {
      this.biometricsSupported = supported && enrolled;
      this.supportedTypes = supportedTypes;
    });
  }

  async authenticate({ pin, options }: { pin?: string; options?: LocalAuthenticationOptions } = {}) {
    if (pin) {
      return;
    }

    const { success } = await authenticateAsync(options);
    return success;
  }

  async setupPin(pin: string) {
    await SecureStore.setItemAsync('pin', pin);
  }
}

export default new Authentication();

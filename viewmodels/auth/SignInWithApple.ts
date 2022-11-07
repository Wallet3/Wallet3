import * as AppleAuthentication from 'expo-apple-authentication';

import { SignInType, SignInWithWeb2 } from './SignInWithWeb2';
import { makeObservable, runInAction } from 'mobx';

import { AppleAuthenticationCredential } from 'expo-apple-authentication';

class SignInWithApple extends SignInWithWeb2 {
  constructor() {
    super();
    makeObservable(this, {});
  }

  init() {
    if (this.isAvailable) return;

    AppleAuthentication.isAvailableAsync()
      .then((v) => runInAction(() => (this.isAvailable = v)))
      .catch(() => {});
  }

  get platform(): string {
    return 'apple';
  }

  async signIn(): Promise<SignInType | undefined> {
    runInAction(() => (this.loading = true));

    try {
      const credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credentials) return;
      return await this.handleCredentials(credentials);
    } catch (e) {
      if ((e as any).code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    } finally {
      runInAction(() => (this.loading = false));
    }

    return;
  }

  private async handleCredentials(credentials: AppleAuthenticationCredential): Promise<SignInType> {
    const { user } = credentials;
    return await super.autoRegister(user);
  }
}

export default new SignInWithApple();

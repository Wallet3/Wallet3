import * as AppleAuthentication from 'expo-apple-authentication';

import { SignInType, SignInWithWeb2 } from './SignInWithWeb2';
import { makeObservable, runInAction } from 'mobx';

import { AppleAuthenticationCredential } from 'expo-apple-authentication';

class SignInWithApple extends SignInWithWeb2 {
  private credentials: AppleAuthenticationCredential | undefined;

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
      if (this.credentials) {
        return await this.handleCredentials(this.credentials);
      }

      this.credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!this.credentials) return;
      return await this.handleCredentials(this.credentials!);
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
    const { email, user } = credentials;

    await super.setUser(user);

    if (!email) {
      const isRegistered = await super.checkUserRegistered();
      if (!isRegistered) {
        await super.generate();
        return SignInType.newUser;
      }

      return super.recoveryKeyExists ? SignInType.recover_key_exists : SignInType.recover_key_not_exists;
    }

    await super.generate();
    return SignInType.newUser;
  }
}

export default new SignInWithApple();

import * as AppleAuthentication from 'expo-apple-authentication';

import { SignInType, SignInWithWeb2 } from './SignInWithWeb2';
import { makeObservable, runInAction } from 'mobx';

import { AppleAuthenticationCredential } from 'expo-apple-authentication';

class SignInWithApple extends SignInWithWeb2 {
  credentials: AppleAuthenticationCredential | undefined;

  constructor() {
    super();

    makeObservable(this, {});

    AppleAuthentication.isAvailableAsync()
      .then((v) => {
        runInAction(() => (this.isAvailable = v));
        console.log('sign in with apple', v);
      })
      .catch(() => {});
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

      console.log(this.credentials!);
      return this.handleCredentials(this.credentials!);
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
      const isRegistered = await super.isUserRegistered();
      if (!isRegistered) super.generate();

      console.log(super.recoveryKeyExists);
      
      return isRegistered
        ? super.recoveryKeyExists
          ? SignInType.recover_key_exists
          : SignInType.recover_key_not_exists
        : SignInType.newUser;
    }

    await super.generate();
    return SignInType.newUser;
  }
}

export default new SignInWithApple();

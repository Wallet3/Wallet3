import * as AppleAuthentication from 'expo-apple-authentication';

import { makeObservable, observable, runInAction } from 'mobx';

import { SignInWithWeb2 } from './SignInWithWeb2';

class SignInWithApple extends SignInWithWeb2 {
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

  async signIn() {
    runInAction(() => (this.loading = true));

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    } catch (e) {
      if ((e as any).code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }

    runInAction(() => (this.loading = false));
  }
}

export default new SignInWithApple();

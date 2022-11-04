import * as Secrets from '../../configs/secret';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { SignInWithWeb2 } from './SignInWithWeb2';
import { runInAction } from 'mobx';

class SignInWithGoogle extends SignInWithWeb2 {
  constructor() {
    super();

    if (Secrets.GoogleSignInConfigs) {
      GoogleSignin.configure(Secrets.GoogleSignInConfigs);
    }

    GoogleSignin.hasPlayServices()
      .then((v) => runInAction(() => (this.isAvailable = v)))
      .catch(() => {});
  }

  async signIn() {
    try {
      const userInfo = await GoogleSignin.signIn();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  }
}

export default new SignInWithGoogle();

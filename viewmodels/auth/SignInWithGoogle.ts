import * as Secrets from '../../configs/secret';

import { GoogleSignin, User, statusCodes } from '@react-native-google-signin/google-signin';
import { SignInType, SignInWithWeb2 } from './SignInWithWeb2';
import { makeObservable, runInAction } from 'mobx';

class SignInWithGoogle extends SignInWithWeb2 {
  private userInfo!: User;

  constructor() {
    super();
    makeObservable(this, {});
  }

  init() {
    if (this.isAvailable) return;

    if (Secrets.GoogleSignInConfigs) {
      GoogleSignin.configure(Secrets.GoogleSignInConfigs);
    }

    GoogleSignin.hasPlayServices()
      .then((v) => runInAction(() => (this.isAvailable = v)))
      .catch(() => {});
  }

  get platform(): string {
    return 'google';
  }

  async signIn(): Promise<SignInType | undefined> {
    runInAction(() => (this.loading = true));

    try {
      if (this.userInfo) {
        return await this.handlerUserInfo(this.userInfo);
      }

      this.userInfo = await GoogleSignin.signIn();
      return await this.handlerUserInfo(this.userInfo);
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
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  private async handlerUserInfo(userInfo: User): Promise<SignInType> {
    return await super.autoRegister(userInfo.user.id);
  }
}

export default new SignInWithGoogle();

import * as Random from 'expo-random';

import { makeObservable, observable } from 'mobx';

import { utils } from 'ethers';

export class SignInWithWeb2 {
  isAvailable = false;
  loading = false;

  constructor() {
    makeObservable(this, { isAvailable: observable, loading: observable });
  }

  protected handleUser(user: string, passcode: string) {
    const userhash = utils.keccak256(Buffer.from(user, 'utf-8').toString('hex'));
    const uid = utils.keccak256(userhash);

    
  }
}

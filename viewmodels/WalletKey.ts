import Authentication from './Authentication';
import Key from '../models/Key';
import { makeObservable } from 'mobx';
export class WalletKey {
  private key: Key;

  constructor(key?: Key) {
    this.key = key || new Key();

    makeObservable(this, {});
  }

  async readSecret(pin?: string) {
    if (!(await Authentication.authenticate({ pin }))) return;
  }
}

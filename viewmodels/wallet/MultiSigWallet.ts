import { action, makeObservable } from 'mobx';

import MultiSigKey from '../../models/entities/MultiSigKey';
import { WalletBase } from './WalletBase';

export class MultiSigWallet extends WalletBase {
  private _key: MultiSigKey;

  readonly isHDWallet = true;
  readonly isMultiSig = true;

  protected get key() {
    return this._key;
  }

  constructor(key: MultiSigKey) {
    super();

    this._key = key;
    makeObservable(this, { newAccount: action, removeAccount: action });
  }

  getSecret(pin?: string | undefined): Promise<string | undefined> {
    throw new Error('Method not implemented.');
  }

  dispose(): void {}

  protected unlockPrivateKey(args: {
    pin?: string | undefined;
    accountIndex?: number | undefined;
  }): Promise<string | undefined> {
    throw new Error('Method not implemented.');
  }
}

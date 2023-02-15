import { action, makeObservable } from 'mobx';

import Authentication from '../auth/Authentication';
import Key from '../../models/entities/Key';
import { WalletBase } from './WalletBase';
import { utils } from 'ethers';

export class SingleSigWallet extends WalletBase {
  private _key: Key;
  private refreshTimer!: NodeJS.Timer;

  lastRefreshedTime = 0;

  readonly isHDWallet: boolean;
  readonly isMultiSig = false;

  protected get key() {
    return this._key;
  }

  constructor(key: Key) {
    super();
    this._key = key;

    const components = key.bip32Xpubkey.split(':');
    this.isHDWallet = components[components.length - 1].startsWith('xpub');
    super.signInPlatform = components.length > 1 ? (components[0] as any) : undefined;
    this.signInUser = components.length > 1 ? components[1] : undefined;

    makeObservable(this, {
      newAccount: action,
      removeAccount: action,
    });
  }

  protected async unlockPrivateKey({ pin, accountIndex }: { pin?: string; accountIndex?: number }) {
    try {
      if (this.isHDWallet) {
        const xprivkey = await Authentication.decrypt(this._key.bip32Xprivkey, pin);
        if (!xprivkey) return undefined;

        const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
        const account = bip32.derivePath(`${accountIndex ?? 0}`);
        return account.privateKey;
      } else {
        const privkey = await Authentication.decrypt(this._key.secret, pin);
        return privkey;
      }
    } catch (error) {}
  }

  async getSecret(pin?: string) {
    try {
      return await Authentication.decrypt(this._key.secret, pin);
    } catch (error) {}
  }

  dispose() {
    clearTimeout(this.refreshTimer);
  }
}

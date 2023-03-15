import Authentication, { AuthOptions } from '../auth/Authentication';

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
  }

  protected async unlockPrivateKey(args: { pin?: string; accountIndex?: number; subPath?: string } & AuthOptions) {
    const { accountIndex, subPath } = args;

    try {
      if (this.isHDWallet) {
        const xprivkey = await Authentication.decrypt(this._key.bip32Xprivkey, args);
        if (!xprivkey) return undefined;

        const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
        const account = bip32.derivePath(`${subPath ?? ''}${accountIndex ?? 0}`);
        return account.privateKey;
      } else {
        const privkey = await Authentication.decrypt(this._key.secret, args);
        return privkey;
      }
    } catch (error) {}
  }

  async getSecret(pin?: string) {
    try {
      return await Authentication.decrypt(this._key.secret, { pin });
    } catch (error) {}
  }

  dispose() {
    clearTimeout(this.refreshTimer);
  }
}

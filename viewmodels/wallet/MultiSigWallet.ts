import { action, makeObservable } from 'mobx';

import Authentication from '../auth/Authentication';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { WalletBase } from './WalletBase';
import secretjs from 'secrets.js-grempe';
import { utils } from 'ethers';

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

  get threshold() {
    return this._key.secretsInfo.threshold;
  }

  get trustedDevice() {
    return this._key.secretsInfo.devices;
  }

  async getSecret(pin?: string): Promise<string | undefined> {
    try {
      return await Authentication.decrypt(this.key.secrets.rootShard, pin);
    } catch (error) {}
  }

  dispose(): void {}

  protected async unlockPrivateKey({
    pin,
  }: {
    pin?: string | undefined;
    accountIndex?: number | undefined;
  }): Promise<string | undefined> {
    try {
      if (this.key.cachedSecrets) {
        // const privKey = secretjs.combine(this.key.cachedBip32Shards);
        // // utils.HDNode.
        // utils.HDNode.fromExtendedKey
      }

      return await Authentication.decrypt(this.key.secrets.bip32Shard, pin);
    } catch (error) {}
  }
}

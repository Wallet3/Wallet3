import MultiSigKey, { MultiSigKeyDeviceInfo } from '../../models/entities/MultiSigKey';
import { action, makeObservable, observable } from 'mobx';

import Authentication from '../auth/Authentication';
import { PairedDevice } from '../tss/management/PairedDevice';
import { WalletBase } from './WalletBase';
import secretjs from 'secrets.js-grempe';
import { utils } from 'ethers';

export class MultiSigWallet extends WalletBase {
  private _key: MultiSigKey;

  readonly isHDWallet = true;
  readonly isMultiSig = true;

  trustedDevices: MultiSigKeyDeviceInfo[];

  protected get key() {
    return this._key;
  }

  constructor(key: MultiSigKey) {
    super();

    this._key = key;
    this.trustedDevices = Array.from(key.secretsInfo.devices);

    makeObservable(this, { trustedDevices: observable });
  }

  get threshold() {
    return this._key.secretsInfo.threshold;
  }

  get trustedDeviceCount() {
    return this.trustedDevices.length + 1;
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

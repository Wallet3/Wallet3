import MultiSigKey, { MultiSigKeyDeviceInfo } from '../../models/entities/MultiSigKey';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import { ShardsAggregator } from '../tss/ShardsAggregator';
import { WalletBase } from './WalletBase';

export class MultiSigWallet extends WalletBase {
  private _key: MultiSigKey;

  readonly isHDWallet = true;
  readonly isMultiSig = true;

  trustedDevices: MultiSigKeyDeviceInfo[];

  get key() {
    return this._key;
  }

  constructor(key: MultiSigKey) {
    super();

    this._key = key;
    this.trustedDevices = Array.from(key.secretsInfo.devices);

    makeObservable(this, { trustedDevices: observable, trustedDeviceCount: computed });
  }

  get threshold() {
    return this.key.secretsInfo.threshold;
  }

  get trustedDeviceCount() {
    return this.trustedDevices.length + 1;
  }

  get distributionId() {
    return this.key.distributionId;
  }

  get secretsInfo() {
    return this.key.secretsInfo;
  }

  removeTrustedDevice(device: MultiSigKeyDeviceInfo) {
    if (this.trustedDeviceCount <= this.threshold) return;

    this._key.secretsInfo.devices = this._key.secretsInfo.devices.filter((d) => d.globalId !== device.globalId);
    this._key.save();

    const index = this.trustedDevices.findIndex((d) => d.globalId === device.globalId);
    index >= 0 && runInAction(() => this.trustedDevices.splice(index, 1));
  }

  addTrustedDevices(devices: MultiSigKeyDeviceInfo[]) {
    this.key.secretsInfo.devices = this.key.secretsInfo.devices.concat(devices);
    this.key.save();

    runInAction(() => (this.trustedDevices = this.key.secretsInfo.devices));
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

      return await Authentication.decrypt(this.key.secrets.bip32Shard!, pin);
    } catch (error) {}
  }

  async requestShardsAggregator(params: { bip32Shard?: boolean; rootShard?: boolean; autoStart?: boolean }, pin?: string) {
    const [bip32Shard, initShard, verifyPrivKey] =
      (await Authentication.decrypt(
        [
          params.bip32Shard ? this.key.secrets.bip32Shard : undefined,
          params.rootShard ? this.key.secrets.rootShard : undefined,
          this.key.secrets.verifySignKey,
        ],
        pin
      )) || [];

    if (!verifyPrivKey) return;

    return new ShardsAggregator({
      initRootShard: initShard!,
      initBip32Shard: bip32Shard,
      autoStart: params.autoStart,
      aggregationParams: params,
      distributionId: this.key.distributionId,
      shardsVersion: this.key.secretsInfo.version,
      threshold: this.key.secretsInfo.threshold,
      verifyPrivKey: Buffer.from(verifyPrivKey!, 'hex'),
    });
  }
}

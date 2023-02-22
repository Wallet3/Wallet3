import MultiSigKey, { MultiSigKeyDeviceInfo } from '../../models/entities/MultiSigKey';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import { ShardsAggregator } from '../tss/ShardsAggregator';
import { WalletBase } from './WalletBase';
import { openShardsAggregator } from '../../common/Modals';
import secretjs from 'secrets.js-grempe';
import { sleep } from '../../utils/async';
import { utils } from 'ethers';

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

  get secretsCached() {
    return this.key.cachedSecrets?.rootEntropy || this.key.cachedSecrets?.bip32XprvKey ? true : false;
  }

  async setSecretsCache(plain?: { rootEntropy?: string; bip32XprvKey?: string }) {
    if (plain) {
      plain.rootEntropy = plain.rootEntropy && (await Authentication.encrypt(plain.rootEntropy));
      plain.bip32XprvKey = plain.bip32XprvKey && (await Authentication.encrypt(plain.bip32XprvKey));
      this.key.cachedSecrets = plain;
      console.log('save cache', plain)
    } else {
      this.key.cachedSecrets = {};
      console.log('delete cache')
    }

    this.key.save();
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

  protected async unlockPrivateKey(args: { pin?: string; accountIndex?: number }) {
    const { pin, accountIndex } = args;

    try {
      const { bip32XprvKey } = this.key.cachedSecrets || {};

      if (bip32XprvKey) {
        const xprivkey = (await Authentication.decrypt(bip32XprvKey, pin))!;
        const bip32 = utils.HDNode.fromExtendedKey(xprivkey);
        const account = bip32.derivePath(`${accountIndex ?? 0}`);
        return account.privateKey;
      }

      const vm = await this.requestShardsAggregator({ autoStart: true, bip32Shard: true }, pin);
      if (!vm) return;

      super.emit('aggregateShards');
      await sleep(2000);

      const xprv = await new Promise<string>((resolve, reject) => {
        openShardsAggregator({ vm, onClosed: () => reject() });
        vm.once('aggregated', ({ bip32Secret }) => resolve(bip32Secret!));
      });

      if (!xprv) return;

      const bip32 = utils.HDNode.fromExtendedKey(xprv);
      const account = bip32.derivePath(`${accountIndex ?? 0}`);
      return account.privateKey;
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
      wallet: this,
    });
  }
}

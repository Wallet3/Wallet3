import { IShardsDistributorConstruction, ShardsDistributor } from './ShardsDistributor';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import Bonjour from '../../common/p2p/Bonjour';
import EventEmitter from 'eventemitter3';
import { KeyManagementService } from './Constants';
import { LanServices } from './management/Common';
import MultiSigKey from '../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../wallet/MultiSigWallet';
import PairedDevices from './management/PairedDevices';
import { ShardSender } from './ShardSender';
import { ShardsAggregator } from './ShardsAggregator';
import { TCPClient } from '../../common/p2p/TCPClient';
import { btoa } from 'react-native-quick-base64';
import eccrypto from 'eccrypto';
import { randomBytes } from 'crypto';

class ShardsRedistributor extends ShardsDistributor {
  readonly wallet: MultiSigWallet;

  get name() {
    return `resd-${this.device.globalId.substring(0, 12)}-${this.id}`;
  }

  get trustedCount() {
    return (
      this.approvedClients.filter((c) => this.wallet.secretsInfo.devices.find((sc) => sc.globalId === c.remoteInfo?.globalId))
        .length + 1
    );
  }

  get distributable() {
    if (this.wallet.secretsInfo.threshold > this.wallet.secretsInfo.devices.length / 2) {
      return this.trustedCount >= this.wallet.secretsInfo.threshold;
    }

    return this.trustedCount >= this.wallet.secretsInfo.devices.length - this.wallet.secretsInfo.threshold;
  }

  constructor(args: IShardsDistributorConstruction & { wallet: MultiSigWallet }) {
    super(args);
    this.wallet = args.wallet;

    makeObservable(this, { trustedCount: computed });
  }

  async start(_?: boolean): Promise<boolean> {
    const succeed = await super.start(false);
    if (!succeed) return false;

    const now = Date.now();
    const signature = (
      await eccrypto.sign(
        Buffer.from(this.protector.privateKey.substring(2), 'hex'),
        Buffer.from(`${now}_${this.wallet.secretsInfo.version}`, 'utf8')
      )
    ).toString('hex');

    Bonjour.publishService(KeyManagementService, this.name, this.port!, {
      role: 'primary',
      func: LanServices.ShardsRedistribution,
      reqId: randomBytes(8).toString('hex'),
      distributionId: this.id,
      info: btoa(JSON.stringify(getDeviceInfo())),
      protocol: 1,
      witness: JSON.stringify({ now, signature }),
    });

    return succeed;
  }

  async distributeSecret(): Promise<MultiSigKey | undefined> {
    const key = await super.distributeSecret();
    if (!key) return undefined;

    this.wallet.setKey(key);
    PairedDevices.refresh();

    return key;
  }
}

export class ShardsRedistributionController extends EventEmitter {
  private wallet: MultiSigWallet;

  aggregator?: ShardsAggregator | null = null;
  redistributor?: ShardsRedistributor | null = null;

  constructor(wallet: MultiSigWallet) {
    super();

    this.wallet = wallet;
    makeObservable(this, { aggregator: observable, redistributor: observable });
  }

  async requestAggregator(pin?: string) {
    this.aggregator?.dispose();

    const vm = await this.wallet.requestShardsAggregator({ bip32Shard: false, rootShard: true, autoStart: true }, pin);

    vm?.once('aggregated', () => {});

    runInAction(() => (this.aggregator = vm));
    return vm;
  }

  async requestRedistributor() {
    if (!this.aggregator) return;
    this.redistributor?.dispose();

    const vm = new ShardsRedistributor({
      mnemonic: this.aggregator.mnemonic!,
      ...this.wallet.keyInfo,
      autoStart: true,
      wallet: this.wallet,
    });

    await runInAction(async () => (this.redistributor = vm));
    return vm;
  }

  dispose() {
    this.aggregator?.dispose();
    this.redistributor?.dispose();
  }
}

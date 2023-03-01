import { computed, makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../common/p2p/Bonjour';
import EventEmitter from 'eventemitter3';
import { KeyManagementService } from './Constants';
import { LanServices } from './management/DistributorDiscovery';
import { MultiSigWallet } from '../wallet/MultiSigWallet';
import { ShardSender } from './ShardSender';
import { ShardsAggregator } from './ShardsAggregator';
import { ShardsDistributor } from './ShardsDistributor';
import { TCPClient } from '../../common/p2p/TCPClient';
import { btoa } from 'react-native-quick-base64';
import eccrypto from 'eccrypto';
import { getDeviceBasicInfo } from '../../common/p2p/Utils';
import { randomBytes } from 'crypto';

class ShardsRedistributor extends ShardsDistributor {
  get name() {
    return `resd-${this.device.globalId.substring(0, 12)}-${this.id}`;
  }

  async start(_?: boolean): Promise<boolean> {
    const succeed = await super.start(false);

    const now = Date.now();
    const signature = (
      await eccrypto.sign(Buffer.from(this.protector.privateKey.substring(2), 'hex'), Buffer.from(`${now}_`, 'utf8'))
    ).toString('hex');

    Bonjour.publishService(KeyManagementService, this.name, this.port!, {
      role: 'primary',
      func: LanServices.ShardsRedistribution,
      reqId: randomBytes(8).toString('hex'),
      distributionId: this.id,
      info: btoa(JSON.stringify(getDeviceBasicInfo())),
      protocol: 1,
      witness: { now, signature },
    });

    return succeed;
  }

  setApprovedClients(clients: TCPClient[]) {
    runInAction(() => (this.approvedClients = clients.map((c) => new ShardSender({ socket: c, distributionId: this.id }))));
  }
}

export class ShardsRedistributorController extends EventEmitter {
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

    const aggregator = await this.wallet.requestShardsAggregator({ bip32Shard: false, rootShard: true, autoStart: true }, pin);

    aggregator?.once('aggregated', () => {});

    runInAction(() => (this.aggregator = aggregator));
    return aggregator;
  }

  async requestRedistributor() {
    if (!this.aggregator) return;

    const vm = new ShardsRedistributor({ mnemonic: this.aggregator.mnemonic!, ...this.wallet.keyInfo });
    vm.setApprovedClients(this.aggregator.clients);

    await runInAction(async () => (this.redistributor = vm));
  }

  dispose() {
    this.aggregator?.dispose();
    this.redistributor?.dispose();
  }
}

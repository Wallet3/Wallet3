import { computed, makeObservable, observable, runInAction } from 'mobx';

import EventEmitter from 'eventemitter3';
import { MultiSigWallet } from '../wallet/MultiSigWallet';
import { ShardSender } from './ShardSender';
import { ShardsAggregator } from './ShardsAggregator';
import { ShardsDistributor } from './ShardsDistributor';
import { TCPClient } from '../../common/p2p/TCPClient';

class ShardsRedistributor extends ShardsDistributor {
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

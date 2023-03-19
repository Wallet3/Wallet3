import { action, computed, makeObservable, observable } from 'mobx';

import App from '../core/App';
import LINQ from 'linq';
import MessageKeys from '../../common/MessageKeys';
import Networks from '../core/Networks';
import { SendTxRequest } from '../account/AccountBase';

export class ERC4337Queue {
  queue: SendTxRequest[] = [];

  get chainQueue() {
    return LINQ.from(this.queue)
      .groupBy((t) => t.tx!.chainId!)
      .select((g, index) => {
        return {
          index,
          network: Networks.find(g.key())!,
          data: g
            .groupBy((req) => req.tx!.from!)
            .select((g2) => {
              return { account: App.findAccount(g2.key())!, txs: g2.toArray() };
            })
            .where((g2) => (g2.account ? true : false))
            .toArray(),
        };
      })
      .where((g) => (g.network ? true : false))
      .toArray();
  }

  get count() {
    return this.queue.length;
  }

  constructor() {
    makeObservable(this, { queue: observable, count: computed, add: action, remove: action, chainQueue: computed });
  }

  add(req: SendTxRequest) {
    this.queue.push(req);
  }

  remove(req: SendTxRequest) {
    const index = this.queue.indexOf(req);
    if (index < 0) return;

    this.queue.splice(index, 1);
  }
}

export default new ERC4337Queue();

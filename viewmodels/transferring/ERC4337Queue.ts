import { AccountBase, SendTxRequest } from '../account/AccountBase';
import { action, computed, makeObservable, observable } from 'mobx';

import App from '../core/App';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import Networks from '../core/Networks';

export type BatchRequest = { requests: SendTxRequest[]; network: INetwork; account: AccountBase };

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
              return { network: Networks.find(g.key())!, account: App.findAccount(g2.key())!, requests: g2.toArray() };
            })
            .where((g2) => (g2.account ? true : false))
            .toArray(),
        };
      })
      .where((g) => (g.network ? true : false))
      .toArray();
  }

  get chainCount() {
    return this.chainQueue.length;
  }

  get accountCount() {
    return LINQ.from(this.chainQueue).sum((g) => g.data.length);
  }

  get count() {
    return this.queue.length;
  }

  constructor() {
    makeObservable(this, {
      queue: observable,
      count: computed,
      chainCount: computed,
      accountCount: computed,
      add: action,
      remove: action,
      batchRemove: action,
      chainQueue: computed,
    });
  }

  add(req: SendTxRequest) {
    req.timestamp = Date.now();
    this.queue.push(req);
  }

  remove(request: SendTxRequest) {
    const index = this.queue.indexOf(request);
    if (index < 0) return;

    this.queue.splice(index, 1);
  }

  batchRemove(requests: SendTxRequest[]) {
    this.queue = this.queue.filter((req) => !requests.includes(req));
  }

  find(query: (req: SendTxRequest) => boolean) {
    return this.queue.find(query);
  }
}

export default new ERC4337Queue();

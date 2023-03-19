import { action, makeObservable, observable } from 'mobx';

import { SendTxRequest } from '../account/AccountBase';
import { providers } from 'ethers';

export class ERC4337TxQueue {
  queue: SendTxRequest[] = [];

  constructor() {
    makeObservable(this, { queue: observable, add: action, remove: action });
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

export default new ERC4337TxQueue();

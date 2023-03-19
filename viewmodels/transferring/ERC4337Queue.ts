import { action, computed, makeObservable, observable } from 'mobx';

import MessageKeys from '../../common/MessageKeys';
import { SendTxRequest } from '../account/AccountBase';

export class ERC4337Queue {
  queue: SendTxRequest[] = [];

  get count() {
    return this.queue.length;
  }

  constructor() {
    makeObservable(this, { queue: observable, count: computed, add: action, remove: action });
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

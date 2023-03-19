import { AccountBase, SendTxRequest } from '../account/AccountBase';
import { makeObservable, observable } from 'mobx';

import { BaseTransaction } from './BaseTransaction';
import { INetwork } from '../../common/Networks';

export class BatchTransactionRequest extends BaseTransaction {
  txs: SendTxRequest[];

  constructor(args: { network: INetwork; account: AccountBase; txs: SendTxRequest[] }) {
    super(args);
    this.txs = args.txs;

    makeObservable(this, { txs: observable });
  }

  removeTx(request: SendTxRequest) {
    const index = this.txs.indexOf(request);
    if (index < 0) return;

    this.txs.splice(index, 1);
  }

  send = () => {};
}

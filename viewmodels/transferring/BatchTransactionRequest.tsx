import { AccountBase, SendTxRequest } from '../account/AccountBase';
import { action, makeObservable, observable } from 'mobx';

import { BaseTransaction } from './BaseTransaction';
import { INetwork } from '../../common/Networks';

export class BatchTransactionRequest extends BaseTransaction {
  requests: SendTxRequest[];

  constructor(args: { network: INetwork; account: AccountBase; requests: SendTxRequest[] }) {
    super(args);
    this.requests = args.requests;

    makeObservable(this, { requests: observable, removeRequest: action });
  }

  removeRequest(request: SendTxRequest) {
    const index = this.requests.indexOf(request);
    if (index < 0) return;

    this.requests.splice(index, 1);
  }

  send = (pin?: string, onNetworkRequest?: () => void) => {
    return super.sendRawTx(
      { onNetworkRequest, txs: this.requests.map((req) => req.tx!), readableInfo: { type: 'batchTx' } },
      pin
    );
  };
}

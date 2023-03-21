import { AccountBase, SendTxRequest } from '../account/AccountBase';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { BaseTransaction } from './BaseTransaction';
import { BigNumber } from 'ethers';
import ERC4337Queue from './ERC4337Queue';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import { createERC4337Client } from '../services/ERC4337';

export class BatchTransactionRequest extends BaseTransaction {
  requests: SendTxRequest[];

  constructor(args: { network: INetwork; account: AccountBase; requests: SendTxRequest[] }) {
    super(args);
    this.requests = args.requests;

    makeObservable(this, { requests: observable, removeRequest: action });
  }

  async estimateGas() {
    runInAction(() => (this.isEstimatingGas = true));

    const inaccurateGas = LINQ.from(this.requests).sum((req) => BigNumber.from(req.tx!.gasLimit).toNumber());
    this.setGasLimit(inaccurateGas + 100_000);

    let totalGas = inaccurateGas;
    let errorMessage = '';

    try {
      const client = await createERC4337Client(this.network.chainId);
      const op = await client?.createUnsignedUserOpForTransactionRequests(this.requests.map((req) => req.tx!));
      totalGas = op ? (op.callGasLimit as BigNumber).add(op.preVerificationGas as BigNumber).toNumber() : inaccurateGas;
    } catch (error) {
      errorMessage = (error as Error).message;
    }

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(totalGas);
      this.txException = errorMessage || '';
    });
  }

  removeRequest(request: SendTxRequest) {
    const index = this.requests.indexOf(request);
    if (index < 0) return;

    this.requests.splice(index, 1);
    ERC4337Queue.remove(request);
  }

  send = (pin?: string, onNetworkRequest?: () => void) => {
    try {
      return super.sendRawTx(
        { onNetworkRequest, txs: this.requests.map((req) => req.tx!), readableInfo: { type: 'batchTx' } },
        pin
      );
    } finally {
      ERC4337Queue.batchRemove(this.requests);
    }
  };
}

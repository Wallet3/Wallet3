import { AccountBase, SendTxRequest } from '../account/AccountBase';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { BaseTransaction } from './BaseTransaction';
import { BigNumber } from 'ethers';
import ERC4337Queue from './ERC4337Queue';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import { createERC4337Client } from '../services/ERC4337';
import { estimateGas } from '../../common/RPC';

export class BatchTransactionRequest extends BaseTransaction {
  requests: SendTxRequest[];

  constructor(args: { network: INetwork; account: AccountBase; requests: SendTxRequest[] }) {
    super(args);
    this.requests = args.requests;

    makeObservable(this, { requests: observable, removeRequest: action });

    this.estimateGas();
  }

  async estimateGas() {
    runInAction(() => (this.isEstimatingGas = true));

    const inaccurateGas =
      LINQ.from(this.requests).sum((req) => BigNumber.from(req.tx!.gasLimit).toNumber()) -
      100_000 * this.requests.length +
      100_000;

    let totalGas = inaccurateGas;
    let errorMessage = '';
    try {
      const client = await createERC4337Client(this.network);
      if (!client) return;

      const callData = await client.encodeBatchExecute(
        this.requests.map((req) => req.tx!.to!),
        this.requests.map((req) => req.tx!.value || '0x0'),
        this.requests.map((req) => req.tx!.data as string)
      );

      const estimated = await estimateGas(this.network.chainId, {
        from: this.network.erc4337!.entryPointAddress,
        to: this.account.address,
        data: callData,
      });

      totalGas = Math.max(estimated.gas ?? 0 + 100_000, totalGas);
      errorMessage = estimated.errorMessage || errorMessage;
    } finally {
      runInAction(() => {
        this.isEstimatingGas = false;
        this.setGasLimit(totalGas);
        this.txException = errorMessage || '';
      });
    }
  }

  removeRequest(request: SendTxRequest) {
    const index = this.requests.indexOf(request);
    if (index < 0) return;

    this.requests.splice(index, 1);
    ERC4337Queue.remove(request);
  }

  send = async (pin?: string, onNetworkRequest?: () => void) => {
    try {
      return await super.sendRawTx(
        { onNetworkRequest, txs: this.requests.map((req) => req.tx!), readableInfo: { type: 'batchTx' } },
        pin
      );
    } finally {
      ERC4337Queue.batchRemove(this.requests);
    }
  };
}

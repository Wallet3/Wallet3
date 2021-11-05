import { IsNull, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../models/Transaction';
import { makeObservable, observable } from 'mobx';

import Database from '../models/Database';
import { sendTransaction } from '../common/RPC';

class TxHub {
  pendingTxs: Transaction[] = [];

  get repository() {
    return Database.txRepository;
  }

  constructor() {
    makeObservable(this, { pendingTxs: observable });
  }

  async init() {
    let unconfirmedTxs = await this.repository.find({ where: { blockNumber: IsNull() } });
    let confirmedTxs: Transaction[] = [];

    await Promise.all(
      unconfirmedTxs.map(async (pendingTx) => {
        const newerTxs = await this.repository.find({
          where: {
            from: pendingTx.from,
            chainId: pendingTx.chainId,
            nonce: MoreThan(pendingTx.nonce),
            blockNumber: Not(IsNull()),
          },
        });

        if (newerTxs.length > 0) {
          await pendingTx.remove();
          confirmedTxs.push(pendingTx);
        }
      })
    );

    unconfirmedTxs = unconfirmedTxs.filter((tx) => !confirmedTxs.includes(tx));
  }

  async broadcastTx({ chainId, txHex, tx }: { chainId: number; txHex: string; tx: ITransaction }) {
    const { result: hash, error } = await sendTransaction(chainId, txHex);

    if (!hash) {
      return;
    }

    this.saveTx(tx);
  }

  saveTx = async (tx: ITransaction) => {
    if ((await this.repository.find({ where: { hash: tx.hash } })).length > 0) {
      return;
    }

    const t = new Transaction();
    t.chainId = tx.chainId!;
    t.from = tx.from!;
    t.to = tx.to!;
    t.data = tx.data as string;
    t.gas = tx.gasLimit as number;
    t.gasPrice = (tx.gasPrice || tx.maxFeePerGas) as number;
    t.priorityPrice = tx.maxPriorityFeePerGas as number;
    t.hash = tx.hash!;
    t.nonce = tx.nonce! as number;
    t.value = tx.value! as string;
    t.timestamp = Date.now();
    t.tokenSymbol = tx.tokenSymbol;
    t.tokenDecimals = tx.tokenDecimals;
    t.receipt = tx.receipt;
    t.amountWei = tx.amountWei;

    await t.save();
  };
}

export default new TxHub();

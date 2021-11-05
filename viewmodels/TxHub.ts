import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../models/Transaction';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getTransactionReceipt, sendTransaction } from '../common/RPC';

import Database from '../models/Database';

class TxHub {
  pendingTxs: Transaction[] = [];

  get repository() {
    return Database.txRepository;
  }

  get pendingCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeObservable(this, { pendingTxs: observable, pendingCount: computed });
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
    runInAction(() => this.pendingTxs.push(...unconfirmedTxs));
    setTimeout(() => this.watchPendingTxs(), 0);
  }

  async watchPendingTxs() {
    const confirmedTxs: Transaction[] = [];
    console.log('watching txs:', this.pendingCount);

    for (let tx of this.pendingTxs) {
      const receipt = await getTransactionReceipt(tx.chainId, tx.hash);
      if (!receipt) {
        continue;
      }

      tx.gasUsed = Number.parseInt(receipt.gasUsed);
      tx.status = Number.parseInt(receipt.status) === 1;
      tx.transactionIndex = Number.parseInt(receipt.transactionIndex);
      tx.blockNumber = Number.parseInt(receipt.blockNumber);
      tx.blockHash = receipt.blockHash;
      await tx.save();
      confirmedTxs.push(tx);

      const invalidTxs = await this.repository.find({
        where: { from: tx.from, chainId: tx.chainId, nonce: LessThanOrEqual(tx.nonce), blockNumber: IsNull() },
      });

      confirmedTxs.push(...invalidTxs);
      await Promise.all(invalidTxs.map((t) => t.remove()));
    }

    runInAction(() => {
      this.pendingTxs = this.pendingTxs.filter((pt) => !confirmedTxs.find((tx) => pt.hash === tx.hash));
    });

    setTimeout(() => this.watchPendingTxs(), 1000 * 5);
  }

  async broadcastTx({ chainId, txHex, tx }: { chainId: number; txHex: string; tx: ITransaction }) {
    const { result: hash, error } = (await sendTransaction(chainId, txHex)) || {};

    if (!hash) {
      return;
    }

    const pendingTx = await this.saveTx({ ...tx, hash });
    if (pendingTx) runInAction(() => this.pendingTxs.push(pendingTx));
    console.log(pendingTx?.hash);
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

    return t;
  };
}

export default new TxHub();

import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../models/Transaction';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getTransactionReceipt, sendTransaction } from '../common/RPC';
import { hideMessage, showMessage } from 'react-native-flash-message';

import Database from '../models/Database';
import { formatAddress } from '../utils/formatter';

class TxHub {
  pendingTxs: Transaction[] = [];
  txs: Transaction[] = [];

  get repository() {
    return Database.txRepository;
  }

  get pendingCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeObservable(this, { pendingTxs: observable, pendingCount: computed, txs: observable });
  }

  async init() {
    let [minedTxs, unconfirmedTxs] = await Promise.all([
      this.repository.find({ where: { blockNumber: MoreThan(0) } }),
      this.repository.find({ where: { blockNumber: IsNull() } }),
    ]);

    runInAction(() => (this.txs = minedTxs));

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

      showMessage({
        message: tx.status ? 'Transaction confirmed' : 'Transaction failed',
        description: `Tx: ${formatAddress(tx.hash, 7, 5)} has been confirmed at block: ${tx.blockNumber}`,
        type: tx.status ? 'success' : 'danger',
        duration: 3000,
      });

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
      this.txs.unshift(...confirmedTxs);
    });

    setTimeout(() => this.watchPendingTxs(), 1000 * 5);
  }

  async broadcastTx({ chainId, txHex, tx }: { chainId: number; txHex: string; tx: ITransaction }) {
    const { result: hash, error } = (await sendTransaction(chainId, txHex)) || {};

    if (error) {
      showMessage({
        message: error.message,
        animated: true,
        autoHide: true,
        backgroundColor: 'orange',
        duration: 3000,
        icon: 'warning',
      });
    }

    if (!hash) {
      return;
    }

    const pendingTx = await this.saveTx({ ...tx, hash });
    if (pendingTx) runInAction(() => this.pendingTxs.push(pendingTx));
  }

  saveTx = async (tx: ITransaction) => {
    if ((await this.repository.find({ where: { hash: tx.hash } })).length > 0) {
      return;
    }

    console.log(tx.readableInfo);

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
    t.value = tx.value!.toString();
    t.timestamp = Date.now();
    t.readableInfo = tx.readableInfo;

    await t.save();

    return t;
  };
}

export default new TxHub();

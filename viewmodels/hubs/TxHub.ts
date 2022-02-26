import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../../models/Transaction';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { getTransactionReceipt, sendTransaction } from '../../common/RPC';

import Database from '../../models/Database';
import Enumerable from 'linq';
import LINQ from 'linq';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

class TxHub {
  private watchTimer!: NodeJS.Timeout;
  pendingTxs: Transaction[] = [];
  txs: Transaction[] = [];

  get allTxs() {
    return this.pendingTxs.concat(this.txs);
  }

  get repository() {
    return Database.txs;
  }

  get pendingCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeObservable(this, { pendingTxs: observable, pendingCount: computed, txs: observable, reset: action });
  }

  async init() {
    let [minedTxs, unconfirmedTxs] = await Promise.all([
      this.repository.find({ where: { blockNumber: MoreThan(0) }, order: { timestamp: 'DESC' }, take: 100 }),
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

    const pendingTxs = LINQ.from(unconfirmedTxs)
      .where((t) => !confirmedTxs.includes(t))
      .groupBy((t) => t.chainId)
      .select((g) =>
        g
          .orderByDescending((t) => t.gasPrice)
          .distinct((t) => t.nonce)
          .toArray()
      )
      .toArray()
      .flat();

    runInAction(() => this.pendingTxs.push(...pendingTxs));
    setTimeout(() => this.watchPendingTxs(), 0);
  }

  async watchPendingTxs() {
    clearTimeout(this.watchTimer);

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
        message: tx.status ? i18n.t('tx-hub-transaction-confirmed') : i18n.t('tx-hub-transaction-failed'),
        description: i18n.t('tx-hub-confirmed-msg', { hash: formatAddress(tx.hash, 7, 5), block: tx.blockNumber }),
        type: tx.status ? 'success' : 'danger',
        duration: 3000,
      });

      try {
        await tx.save();
      } catch (error) {}

      confirmedTxs.push(tx);

      const invalidTxs = await this.repository.find({
        where: { from: tx.from, chainId: tx.chainId, nonce: LessThanOrEqual(tx.nonce), blockNumber: IsNull() },
      });

      confirmedTxs.push(...invalidTxs);
      await Promise.all(invalidTxs.map((t) => t.remove()));
    }

    if (this.pendingTxs.length > 0) this.watchTimer = setTimeout(() => this.watchPendingTxs(), 1000 * 3);

    if (confirmedTxs.length === 0) return;

    runInAction(() => {
      this.txs.unshift(...confirmedTxs.filter((t) => t.blockHash && !this.txs.find((t2) => t2.hash === t.hash)));

      const latestNonce = Enumerable.from(this.txs)
        .take(10)
        .maxBy((i) => i.nonce).nonce;

      this.pendingTxs = this.pendingTxs.filter(
        (pt) => !confirmedTxs.find((tx) => pt.hash === tx.hash) || pt.nonce > latestNonce
      );
    });
  }

  async broadcastTx({ chainId, txHex, tx }: { chainId: number; txHex: string; tx: ITransaction }) {
    const { result: hash, error } = (await sendTransaction(chainId, txHex)) || {};

    if (error || !hash) {
      showMessage({
        message: error?.message ?? i18n.t('tx-hub-transaction-failed'),
        animated: true,
        autoHide: true,
        backgroundColor: 'orange',
        duration: 3000,
        icon: 'warning',
      });
    }

    if (!hash) {
      return undefined;
    }

    const pendingTx = await this.saveTx({ ...tx, hash });
    if (!pendingTx) return undefined;

    runInAction(() => {
      const sameNonces = [pendingTx, ...this.pendingTxs.filter((i) => i.nonce === pendingTx.nonce)];
      const maxPriTx = Enumerable.from(sameNonces).maxBy((t) => t.gasPrice);

      this.pendingTxs = [maxPriTx, ...this.pendingTxs.filter((t) => t.nonce !== pendingTx.nonce)];
    });

    clearTimeout(this.watchTimer);
    this.watchTimer = setTimeout(() => this.watchPendingTxs(), 1000);

    return hash;
  }

  saveTx = async (tx: ITransaction) => {
    if ((await this.repository.find({ where: { hash: tx.hash } })).length > 0) {
      return;
    }

    const t = new Transaction();
    t.hash = tx.hash!;
    t.chainId = tx.chainId!;
    t.from = tx.from!;
    t.to = tx.to!;
    t.data = tx.data as string;
    t.gas = tx.gasLimit as number;
    t.gasPrice = (tx.gasPrice || tx.maxFeePerGas) as number;
    t.priorityPrice = tx.maxPriorityFeePerGas as number;
    t.nonce = tx.nonce! as number;
    t.value = tx.value!.toString();
    t.timestamp = Date.now();
    t.readableInfo = tx.readableInfo;

    await t.save();
    return t;
  };

  reset() {
    this.pendingTxs = [];
    this.txs = [];
  }
}

export default new TxHub();

import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../../models/Transaction';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { getTransactionReceipt, sendTransaction } from '../../common/RPC';

import Database from '../../models/Database';
import LINQ from 'linq';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';
import { startLayoutAnimation } from '../../utils/animations';

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
      this.repository.find({
        where: { blockNumber: MoreThan(0), hash: Not(IsNull()) },
        order: { timestamp: 'DESC' },
        take: 100,
      }),
      this.repository.find({ where: { blockNumber: IsNull() } }),
    ]);

    runInAction(() => (this.txs = minedTxs));

    const abandonedTxs = unconfirmedTxs.filter((tx) =>
      minedTxs.find((t) => t.from === tx.from && t.chainId === tx.chainId && t.nonce >= tx.nonce)
    );

    abandonedTxs.map((t) => t.remove());
    unconfirmedTxs = unconfirmedTxs.filter((un) => !abandonedTxs.find((ab) => ab.hash === un.hash));

    const pendingTxs = LINQ.from(unconfirmedTxs)
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

  loadMore = async () => {
    if (!this.repository) return;

    const moreTxs = await this.repository.find({
      where: { blockNumber: MoreThan(0), hash: Not(IsNull()) },
      order: { timestamp: 'DESC' },
      skip: this.txs.length,
      take: 100,
    });

    runInAction(() => this.txs.push(...moreTxs));
  };

  async watchPendingTxs() {
    clearTimeout(this.watchTimer);

    const confirmedTxs: Transaction[] = [];
    const abandonedTxs: Transaction[] = [];

    for (let tx of this.pendingTxs) {
      const receipt = await getTransactionReceipt(tx.chainId, tx.hash);

      if (this.txs.find((t) => t.from === tx.from && t.chainId === tx.chainId && t.nonce >= tx.nonce && t.blockHash)) {
        abandonedTxs.push(tx);
        continue;
      }

      if (!receipt || receipt.status === null || !receipt.blockHash) {
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

      abandonedTxs.push(...invalidTxs);
      await Promise.all(invalidTxs.map((t) => t.remove()));
    }

    if (this.pendingTxs.length > 0) this.watchTimer = setTimeout(() => this.watchPendingTxs(), 1000 * 3);

    if (confirmedTxs.length === 0 && abandonedTxs.length === 0) return;

    runInAction(() => {
      const newTxs = this.txs.filter((tx) => !abandonedTxs.find((t) => t.hash === tx.hash));
      newTxs.unshift(...confirmedTxs.filter((t) => t.blockHash && !this.txs.find((t2) => t2.hash === t.hash)));

      startLayoutAnimation();

      this.txs = LINQ.from(newTxs)
        .distinct((t) => t.hash)
        .toArray();

      this.pendingTxs = this.pendingTxs.filter(
        (pt) =>
          ((pt.hash && !confirmedTxs.find((tx) => pt.hash === tx.hash)) || !abandonedTxs.find((tx) => tx.hash === pt.hash)) &&
          pt.nonce >
            LINQ.from(this.txs)
              .where((t) => t.chainId === pt.chainId)
              .take(5)
              .maxBy((i) => i.nonce).nonce
      );

      abandonedTxs.map((t) => t.remove());
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

      return;
    }

    const pendingTx = await this.saveTx({ ...tx, hash });
    if (!pendingTx) return undefined;

    clearTimeout(this.watchTimer);

    runInAction(() => {
      const sameNonces = [
        pendingTx,
        ...this.pendingTxs.filter((i) => i.nonce === pendingTx.nonce && i.chainId === pendingTx.chainId),
      ];
      55;

      const maxPriTx = LINQ.from(sameNonces).maxBy((t) => t.gasPrice);

      this.pendingTxs = [maxPriTx, ...this.pendingTxs.filter((t) => !sameNonces.find((t2) => t2.hash === t.hash))];
    });

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

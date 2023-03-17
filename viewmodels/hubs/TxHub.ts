import { HOUR, MINUTE } from '../../utils/time';
import { IsNull, LessThanOrEqual, MoreThan, Not } from 'typeorm';
import Transaction, { ITransaction } from '../../models/entities/Transaction';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { getTransactionReceipt, sendTransaction } from '../../common/RPC';

import Database from '../../models/Database';
import EventEmitter from 'eventemitter3';
import { INetwork } from '../../common/Networks';
import LINQ from 'linq';
import { UserOperationStruct } from '@account-abstraction/contracts/dist/types/EntryPoint';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { isTransactionAbandoned } from '../services/EtherscanPublicTag';
import { logTxConfirmed } from '../services/Analytics';
import { showMessage } from 'react-native-flash-message';

interface Events {
  txConfirmed: (tx: Transaction) => void;
}

class TxHub extends EventEmitter<Events> {
  private watchTimer!: NodeJS.Timeout;
  pendingTxs: Transaction[] = [];
  txs: Transaction[] = [];

  get allTxs() {
    return this.pendingTxs.concat(this.txs);
  }

  get repository() {
    return Database.txs;
  }

  get erc4337Repo() {
    return Database.erc4337Txs;
  }

  get pendingCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    super();
    makeObservable(this, { pendingTxs: observable, pendingCount: computed, txs: observable, reset: action });
  }

  async init() {
    let [minedTxs, unconfirmedTxs, mined4337Txs, unconfirmed4337Txs] = await Promise.all([
      this.repository.find({
        where: { blockHash: Not(IsNull()) },
        order: { timestamp: 'DESC' },
        take: 100,
      }),
      this.repository.find({ where: { blockHash: IsNull() } }),
      this.erc4337Repo.find({
        where: { blockHash: Not(IsNull()) },
        order: { timestamp: 'DESC' },
        take: 100,
      }),
      this.erc4337Repo.find({ where: { blockHash: IsNull() } }),
    ]);

    const confirmed = LINQ.from(minedTxs.concat(mined4337Txs))
      .orderByDescending((t) => t.timestamp)
      .toArray();

    await runInAction(async () => (this.txs = confirmed));

    const abandonedTxs = unconfirmedTxs.filter((un) =>
      minedTxs.find((t) => t.from.toLowerCase() === un.from.toLowerCase() && t.chainId === un.chainId && t.nonce >= un.nonce)
    );

    unconfirmedTxs = unconfirmedTxs.filter((un) => !abandonedTxs.find((ab) => ab.hash === un.hash));

    abandonedTxs.map((t) => t.remove());

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
    setTimeout(() => this.watchPendingTxs(), 10);
  }

  loadMore = async () => {
    if (this.txs.length <= 100) return;
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
      if (!tx.hash) {
        abandonedTxs.push(tx);
        continue;
      }

      const receipt = await getTransactionReceipt(tx.chainId, tx.hash);

      if (this.txs.find((t) => t.from === tx.from && t.chainId === tx.chainId && t.nonce >= tx.nonce && t.blockHash)) {
        abandonedTxs.push(tx);
        continue;
      }

      if (!receipt || receipt.status === null || !receipt.blockHash) {
        if (Date.now() > tx.timestamp + (__DEV__ ? 3 : 60) * MINUTE && (await isTransactionAbandoned(tx.chainId, tx.hash))) {
          abandonedTxs.push(tx);
        }
        continue;
      }

      confirmedTxs.push(tx);

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

      const invalidTxs = await this.repository.find({
        where: { from: tx.from, chainId: tx.chainId, nonce: LessThanOrEqual(tx.nonce), blockNumber: IsNull() },
      });

      abandonedTxs.push(...invalidTxs);
      await Promise.all(invalidTxs.map((t) => t.remove()));
    }

    if (this.pendingTxs.length > 0) this.watchTimer = setTimeout(() => this.watchPendingTxs(), 1000 * 3);

    if (confirmedTxs.length === 0 && abandonedTxs.length === 0) return;

    runInAction(() => {
      const minedTxs = this.txs.filter((tx) => !abandonedTxs.find((t) => t.hash === tx.hash));
      minedTxs.unshift(...confirmedTxs.filter((t) => t.blockHash && !this.txs.find((t2) => t2.hash === t.hash)));

      this.txs = LINQ.from(minedTxs)
        .distinct((t) => t.hash)
        .toArray();

      const toRemove = this.pendingTxs.filter(
        (pt) => confirmedTxs.find((tx) => tx.hash === pt.hash) || abandonedTxs.find((tx) => tx.hash === pt.hash)
      );

      const newPending = this.pendingTxs.filter(
        (pt) =>
          !toRemove.find((tx) => tx.hash === pt.hash) &&
          pt.nonce >
            (LINQ.from(this.txs)
              .where((t) => t.chainId === pt.chainId)
              .take(10)
              .orderByDescending((i) => i.nonce)
              .toArray()[0]?.nonce ?? -1)
      );

      abandonedTxs.map((t) => t.remove());

      this.pendingTxs = newPending;
    });

    confirmedTxs.forEach((tx) => {
      logTxConfirmed(tx);
      super.emit('txConfirmed', tx);
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

    this.watchTimer = setTimeout(() => this.watchPendingTxs(), 1200);

    return hash;
  }

  async watchERC4337Op(network: INetwork, opHash: string, struct: UserOperationStruct) {
    // const txHash = await api.getUserOpReceipt(opHash);
  }

  saveTx = async (tx: ITransaction) => {
    if ((await this.repository.find({ where: { hash: tx.hash } })).length > 0) {
      return;
    }

    const t = new Transaction();
    t.hash = tx.hash!;
    t.chainId = tx.chainId!;
    t.from = tx.from!;
    t.to = tx.to || 'Deploy Contract';
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
    this.removeAllListeners();
  }
}

export default new TxHub();

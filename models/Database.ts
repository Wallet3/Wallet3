import { Connection, Repository, createConnection } from 'typeorm';
import WCSession_v1, { WCSession_v1_legacy } from './WCSession_v1';

import Chain from './Chain';
import InpageDApp from './InpageDApp';
import Key from './Key';
import Transaction from './Transaction';

class Database {
  private _connection!: Connection;

  keys!: Repository<Key>;
  txs!: Repository<Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  wcV1Sessions_legacy!: Repository<WCSession_v1_legacy>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: __DEV__ ? 'dev5' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1, InpageDApp, Chain],
    });

    this.keys = this._connection.getRepository(Key);
    this.txs = this._connection.getRepository(Transaction);
    this.wcV1Sessions = this._connection.getRepository(WCSession_v1);
    this.wcV1Sessions_legacy = this._connection.getRepository(WCSession_v1_legacy);
    this.inpageDApps = this._connection.getRepository(InpageDApp);
    this.chains = this._connection.getRepository(Chain);
  }

  async reset() {
    await Promise.all([
      this.keys.clear(),
      this.txs.clear(),
      this.wcV1Sessions.clear(),
      this.inpageDApps.clear(),
      this.chains.clear(),
    ]);
  }
}

export default new Database();

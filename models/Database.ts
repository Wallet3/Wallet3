import { Connection, Repository, createConnection } from 'typeorm';

import Key from './Key';
import Transaction from './Transaction';
import WCSession_v1 from './WCSession_v1';

class Database {
  private _connection?: Connection;

  keyRepository!: Repository<Key>;
  txRepository!: Repository<Transaction>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: 'test21',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1],
    });

    this.keyRepository = this._connection.getRepository(Key);
    this.txRepository = this._connection.getRepository(Transaction);
  }

  dispose() {
    this._connection?.close();
    this._connection = undefined;
  }
}

export default new Database();

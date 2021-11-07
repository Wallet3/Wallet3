import { Connection, Repository, createConnection } from 'typeorm';

import Key from './Key';
import Transaction from './Transaction';

class Database {
  private _connection?: Connection;

  keyRepository!: Repository<Key>;
  txRepository!: Repository<Transaction>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: 'test19',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction],
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

import { Connection, Repository, createConnection } from 'typeorm';

import Key from './Key';

class Database {
  private _connection?: Connection;
  keyRepository!: Repository<Key>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: 'test15',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key],
    });

    this.keyRepository = this._connection.getRepository(Key);
  }

  dispose() {
    this._connection?.close();
    this._connection = undefined;
  }
}

export default new Database();

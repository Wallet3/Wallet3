import { Connection, Repository, createConnection } from 'typeorm';

import Key from './Key';

class Database {
  private _connection!: Connection;
  keyRepository!: Repository<Key>;

  async init() {
    this._connection = await createConnection({
      type: 'expo',
      database: 'test2',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key],
    });

    this.keyRepository = this._connection.getRepository(Key);
  }
}

export default new Database();

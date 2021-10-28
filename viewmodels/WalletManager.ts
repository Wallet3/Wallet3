import { Connection, createConnection } from 'typeorm';

import Key from '../models/Key';

class WalletManager {
  private _connection!: Connection;

  async init() {
    console.log('init db');
    this._connection = await createConnection({
      type: 'expo',
      database: 'test',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key],
    });

    console.log(this._connection.driver.database);
    const keys = this._connection.getRepository(Key);
    console.log(await keys.find());
  }
}

export default new WalletManager();

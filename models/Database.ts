import { Connection, Repository, createConnection } from 'typeorm';

import InpageDApp from './InpageDApp';
import Key from './Key';
import Transaction from './Transaction';
import WCSession_v1 from './WCSession_v1';

class Database {
  private _connection!: Connection;

  keyRepository!: Repository<Key>;
  txRepository!: Repository<Transaction>;
  wcSessionV1Repository!: Repository<WCSession_v1>;
  inpageDApps!: Repository<InpageDApp>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: __DEV__ ? 'dev1' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1, InpageDApp],
    });

    this.keyRepository = this._connection.getRepository(Key);
    this.txRepository = this._connection.getRepository(Transaction);
    this.wcSessionV1Repository = this._connection.getRepository(WCSession_v1);
    this.inpageDApps = this._connection.getRepository(InpageDApp);
  }

  async reset() {
    await Promise.all([this.keyRepository.clear(), this.txRepository.clear(), this.wcSessionV1Repository.clear()]);
  }
}

export default new Database();

import { Connection, Repository, createConnection } from 'typeorm';

import Chain from './Chain';
import EtherscanContract from './EtherscanContract';
import InpageDApp from './InpageDApp';
import Key from './Key';
import Transaction from './Transaction';
import WCSession_v1 from './WCSession_v1';

class Database {
  private _connection!: Connection;

  keys!: Repository<Key>;
  txs!: Repository<Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;
  etherscan_contracts!: Repository<EtherscanContract>;

  async init() {
    if (this._connection) return;

    this._connection = await createConnection({
      type: 'expo',
      database: __DEV__ ? 'dev5' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1, InpageDApp, Chain, EtherscanContract],
    });

    this.keys = this._connection.getRepository(Key);
    this.txs = this._connection.getRepository(Transaction);
    this.wcV1Sessions = this._connection.getRepository(WCSession_v1);
    this.inpageDApps = this._connection.getRepository(InpageDApp);
    this.chains = this._connection.getRepository(Chain);
    this.etherscan_contracts = this._connection.getRepository(EtherscanContract);
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

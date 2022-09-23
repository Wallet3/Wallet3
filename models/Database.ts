import { DataSource, Repository } from 'typeorm';

import Chain from './Chain';
import EtherscanContract from './EtherscanContract';
import InpageDApp from './InpageDApp';
import Key from './Key';
import NFT from './NFT';
import Transaction from './Transaction';
import WCSession_v1 from './WCSession_v1';

class Database {
  private _dataSource!: DataSource;

  keys!: Repository<Key>;
  txs!: Repository<Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;
  etherscan_contracts!: Repository<EtherscanContract>;
  nfts!: Repository<NFT>;

  async init() {
    if (this._dataSource) return;

    this._dataSource = new DataSource({
      type: 'expo',
      database: __DEV__ ? 'dev5' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1, InpageDApp, Chain, EtherscanContract, NFT],
    });

    await this._dataSource.initialize();

    this.keys = this._dataSource.getRepository(Key);
    this.txs = this._dataSource.getRepository(Transaction);
    this.wcV1Sessions = this._dataSource.getRepository(WCSession_v1);
    this.inpageDApps = this._dataSource.getRepository(InpageDApp);
    this.chains = this._dataSource.getRepository(Chain);
    this.etherscan_contracts = this._dataSource.getRepository(EtherscanContract);
    this.nfts = this._dataSource.getRepository(NFT);
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

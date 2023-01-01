import { DataSource, Repository } from 'typeorm';

import AddressTag from './entities/AddressTag';
import Chain from './entities/Chain';
import EtherscanContract from './entities/EtherscanContract';
import InpageDApp from './entities/InpageDApp';
import Key from './entities/Key';
import NFT from './entities/NFT';
import SourcifyMetadata from './entities/SourcifyItem';
import Transaction from './entities/Transaction';
import WCSession_v1 from './entities/WCSession_v1';

class Database {
  private _dataSource!: DataSource;

  keys!: Repository<Key>;
  txs!: Repository<Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;
  etherscan_contracts!: Repository<EtherscanContract>;
  sourcify_metadata!: Repository<SourcifyMetadata>;
  cloud_address_tags!: Repository<AddressTag>;
  nfts!: Repository<NFT>;

  async init() {
    if (this._dataSource) return;

    this._dataSource = new DataSource({
      type: 'expo',
      database: __DEV__ ? 'dev5' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: [Key, Transaction, WCSession_v1, InpageDApp, Chain, EtherscanContract, NFT, SourcifyMetadata, AddressTag],
    });

    await this._dataSource.initialize();

    this.keys = this._dataSource.getRepository(Key);
    this.txs = this._dataSource.getRepository(Transaction);
    this.wcV1Sessions = this._dataSource.getRepository(WCSession_v1);
    this.inpageDApps = this._dataSource.getRepository(InpageDApp);
    this.chains = this._dataSource.getRepository(Chain);
    this.etherscan_contracts = this._dataSource.getRepository(EtherscanContract);
    this.sourcify_metadata = this._dataSource.getRepository(SourcifyMetadata);
    this.cloud_address_tags = this._dataSource.getRepository(AddressTag);
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

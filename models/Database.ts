import { DataSource, EntitySchema, MixedList, Repository } from 'typeorm';

import AddressTag from './entities/AddressTag';
import Chain from './entities/Chain';
import EtherscanContract from './entities/EtherscanContract';
import InpageDApp from './entities/InpageDApp';
import Key from './entities/Key';
import MultiSigKey from './entities/MultiSigKey';
import NFT from './entities/NFT';
import SourcifyMetadata from './entities/SourcifyItem';
import Transaction from './entities/Transaction';
import UrlTag from './entities/UrlTag';
import WCSession_v1 from './entities/WCSession_v1';
import WCV2_Session from './entities/WCSession_v2';

const Schemas: MixedList<Function | string | EntitySchema> = [
  Key,
  Transaction,
  WCSession_v1,
  InpageDApp,
  Chain,
  EtherscanContract,
  NFT,
  SourcifyMetadata,
  AddressTag,
  WCV2_Session,
  UrlTag,
];

if (__DEV__) {
  Schemas.push(MultiSigKey);
}

class Database {
  private _dataSource!: DataSource;

  keys!: Repository<Key>;
  txs!: Repository<Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  wcV2Sessions!: Repository<WCV2_Session>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;
  etherscan_contracts!: Repository<EtherscanContract>;
  sourcify_metadata!: Repository<SourcifyMetadata>;
  cloud_address_tags!: Repository<AddressTag>;
  nfts!: Repository<NFT>;
  urls!: Repository<UrlTag>;

  async init() {
    if (this._dataSource) return;

    this._dataSource = new DataSource({
      type: 'expo',
      database: __DEV__ ? 'dev5' : 'appdata',
      driver: require('expo-sqlite'),
      synchronize: true,
      entities: Schemas,
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
    this.wcV2Sessions = this._dataSource.getRepository(WCV2_Session);
    this.urls = this._dataSource.getRepository(UrlTag);
  }

  async reset() {
    await Promise.all([
      this.keys.clear(),
      this.txs.clear(),
      this.wcV1Sessions.clear(),
      this.wcV2Sessions.clear(),
      this.inpageDApps.clear(),
      this.chains.clear(),
    ]);
  }
}

export default new Database();

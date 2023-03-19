import { DataSource, EntityManager, EntitySchema, MixedList, Repository } from 'typeorm';

import AddressTag from './entities/AddressTag';
import Chain from './entities/Chain';
import ERC4337Transaction from './entities/ERC4337Transaction';
import EtherscanContract from './entities/EtherscanContract';
import InpageDApp from './entities/InpageDApp';
import Key from './entities/Key';
import MultiSigKey from './entities/MultiSigKey';
import ShardKey from './entities/ShardKey';
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
  SourcifyMetadata,
  AddressTag,
  WCV2_Session,
  UrlTag,
  MultiSigKey,
  ShardKey,
  ERC4337Transaction,
];

class Database {
  private _dataSource!: DataSource;

  keys!: Repository<Key>;
  multiSigKeys!: Repository<MultiSigKey>;
  shardKeys!: Repository<ShardKey>;
  txs!: Repository<Transaction>;
  erc4337Txs!: Repository<ERC4337Transaction>;
  wcV1Sessions!: Repository<WCSession_v1>;
  wcV2Sessions!: Repository<WCV2_Session>;
  inpageDApps!: Repository<InpageDApp>;
  chains!: Repository<Chain>;
  etherscan_contracts!: Repository<EtherscanContract>;
  sourcify_metadata!: Repository<SourcifyMetadata>;
  cloud_address_tags!: Repository<AddressTag>;
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
    this.multiSigKeys = this._dataSource.getRepository(MultiSigKey);
    this.chains = this._dataSource.getRepository(Chain);
    this.shardKeys = this._dataSource.getRepository(ShardKey);

    this.wcV1Sessions = this._dataSource.getRepository(WCSession_v1);
    this.wcV2Sessions = this._dataSource.getRepository(WCV2_Session);
    this.txs = this._dataSource.getRepository(Transaction);
    this.erc4337Txs = this._dataSource.getRepository(ERC4337Transaction);
    this.inpageDApps = this._dataSource.getRepository(InpageDApp);
    this.etherscan_contracts = this._dataSource.getRepository(EtherscanContract);
    this.sourcify_metadata = this._dataSource.getRepository(SourcifyMetadata);
    this.cloud_address_tags = this._dataSource.getRepository(AddressTag);
    this.urls = this._dataSource.getRepository(UrlTag);
  }

  execTransaction<T>(runInTransaction: (entityManager: EntityManager) => Promise<T>) {
    return this._dataSource.manager.transaction(runInTransaction);
  }

  async reset() {
    await Promise.all([
      this.keys.clear(),
      this.txs.clear(),
      this.wcV1Sessions.clear(),
      this.wcV2Sessions.clear(),
      this.inpageDApps.clear(),
      this.chains.clear(),
      this.multiSigKeys.clear(),
      this.erc4337Txs.clear(),
    ]);
  }
}

export default new Database();

import App from '../core/App';
import EventEmitter from 'events';
import InpageDApp from '../../models/entities/InpageDApp';
import Networks from '../core/Networks';
import { WCClientMeta } from '../../models/entities/WCSession_v1';

export class MetamaskDApp extends EventEmitter {
  dapp: InpageDApp;
  appMeta: WCClientMeta | null = null;

  isMobileApp = true;

  get lastUsedTimestamp() {
    return this.dapp.lastUsedTimestamp;
  }

  get activeAccount() {
    return App.findAccount(this.dapp.lastUsedAccount);
  }

  get activeNetwork() {
    return Networks.find(this.dapp.lastUsedChainId) || Networks.current;
  }

  get chains() {
    return [Number(this.dapp.lastUsedChainId)];
  }

  get accounts() {
    return [this.dapp.lastUsedAccount];
  }

  get hostname() {
    return this.dapp.origin;
  }

  get origin() {
    return this.dapp.origin;
  }

  get lastUsedAccount() {
    return this.dapp.lastUsedAccount;
  }

  get lastUsedChainId() {
    return this.dapp.lastUsedChainId;
  }

  constructor(app: InpageDApp) {
    super();

    this.dapp = app;
    this.appMeta = {
      description: app.metadata.desc || '',
      icons: [app.metadata.icon],
      name: app.metadata.title,
      url: app.origin,
    };
  }

  setLastUsedChain(chainId: number | string) {
    try {
      this.dapp.lastUsedChainId = `${chainId}`;
      this.dapp.save();
    } catch (error) {}
  }

  setLastUsedAccount(account: string) {
    try {
      this.dapp.lastUsedAccount = account;
      this.dapp.save();
    } catch (error) {}
  }

  setLastUsedTimestamp(timestamp: number) {
    try {
      this.dapp.lastUsedTimestamp = timestamp;
      this.dapp.save();
    } catch (error) {}
  }

  killSession() {
    this.dapp.remove();
    this.emit('removed', this);
  }
}

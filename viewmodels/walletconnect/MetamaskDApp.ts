import InpageDApp from '../../models/InpageDApp';
import { WCClientMeta } from '../../models/WCSession_v1';
import App from '../App';
import Networks from '../Networks';

export class MetamaskDApp {
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

  get id() {
    return this.dapp.origin;
  }

  constructor(app: InpageDApp) {
    this.dapp = app;
    this.appMeta = {
      description: app.metadata.desc || '',
      icons: [app.metadata.icon],
      name: app.metadata.title,
      url: app.origin,
    };
  }

  setLastUsedChain(chainId: number) {
    this.dapp.lastUsedChainId = `${chainId}`;
    this.dapp.save();
  }

  setLastUsedAccount(account: string) {
    this.dapp.lastUsedAccount = account;
    this.dapp.save();
  }

  killSession() {
    this.dapp.remove();
  }
}

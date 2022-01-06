import App from '../App';
import Database from '../../models/Database';

interface Payload {
  method: string;
  params: any[] | any;
  __mmID: string;
  hostname?: string;

  pageMetadata?: { icon: string; title: string; desc?: string };
}

export interface ConnectInpageDApp extends Payload {
  origin: string;
}

class InpageDAppHub {
  get inpageDApps() {
    return Database.inpageDApps;
  }

  handle(origin: string, payload: Payload) {
    const { method, params } = payload;

    switch (method) {
      case 'eth_accounts':
        return this.eth_accounts(origin, payload);
    }
  }

  private async eth_accounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = await this.inpageDApps.findOne({ where: { origin } });
    if (dapp) return [dapp.lastUsedAccount];

    PubSub.publish('openConnectInpageDApp', { origin, ...payload } as ConnectInpageDApp);
    // PubSub.
    // return [App.currentWallet?.currentAccount?.address];
  }
}

export default new InpageDAppHub();

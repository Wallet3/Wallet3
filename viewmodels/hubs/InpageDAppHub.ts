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
  resolve: (accounts: string[]) => void;
}

class InpageDAppHub {
  get inpageDApps() {
    return Database.inpageDApps;
  }

  async handle(origin: string, payload: Payload) {
    const { method, params, __mmID } = payload;
    let response: any;

    switch (method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        response = await this.eth_accounts(origin, payload);
        console.log('eth_accounts', response);
        break;
    }

    return JSON.stringify({ type: 'INPAGE_RESPONSE', payload: { __mmID, error: undefined, response } });
  }

  private async eth_accounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = await this.inpageDApps.findOne({ where: { origin } });
    if (dapp) return [dapp.lastUsedAccount];

    return new Promise<string[]>((resolve) => {
      PubSub.publish('openConnectInpageDApp', { resolve, origin, ...payload } as ConnectInpageDApp);
    });
  }
}

export default new InpageDAppHub();

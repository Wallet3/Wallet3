import App from '../App';
import Database from '../../models/Database';
import InpageDApp from '../../models/InpageDApp';
import Networks from '../Networks';

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
  apps = new Map<string, InpageDApp>();

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
      case 'eth_chainId':
        response = `0x${Number(42161).toString(16)}`; //`0x${Number(this.apps.get(origin)?.lastUsedChainId ?? 1).toString(16)}`;
        console.log('eth_chainId', response)
        break;
    }

    return JSON.stringify({ type: 'INPAGE_RESPONSE', payload: { __mmID, error: undefined, response } });
  }

  private async eth_accounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = this.apps.get(origin) || (await this.inpageDApps.findOne({ where: { origin } }));
    if (dapp) return [dapp.lastUsedAccount];

    return new Promise<string[]>((approve) => {
      const resolve = (accounts: string[]) => {
        const app = new InpageDApp();
        app.origin = origin;
        app.lastUsedAccount = accounts[0];
        app.lastUsedChainId = Networks.current.chainId;
        this.apps.set(origin, app);
        approve(accounts);
      };

      PubSub.publish('openConnectInpageDApp', { resolve, origin, ...payload } as ConnectInpageDApp);
    });
  }
}

export default new InpageDAppHub();

import App from '../App';
import Database from '../../models/Database';
import EventEmitter from 'events';
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
  approve: () => void;
  reject: () => void;
}

class InpageDAppHub extends EventEmitter {
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
        response = `0x${Number(this.apps.get(origin)?.lastUsedChainId ?? Networks.current.chainId).toString(16)}`;
        console.log('eth_chainId', response);
        break;
      case 'wallet_switchEthereumChain':
        response = await this.wallet_switchEthereumChain(origin, params);
        break;
    }

    return JSON.stringify({ type: 'INPAGE_RESPONSE', payload: { __mmID, error: undefined, response } });
  }

  private async getDApp(origin: string) {
    return this.apps.get(origin) || (await this.inpageDApps.findOne({ where: { origin } }));
  }

  private async eth_accounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = await this.getDApp(origin);
    if (dapp) {
      this.apps.set(origin, dapp);
      const account = App.allAccounts.find((a) => a.address === dapp.lastUsedAccount); // Ensure last used account is still available
      return [account?.address ?? App.allAccounts[0].address];
    }

    return new Promise<string[]>((resolve) => {
      const approve = () => {
        const account = App.currentWallet?.currentAccount?.address!;
        const app = new InpageDApp();
        app.origin = origin;
        app.lastUsedAccount = account;
        app.lastUsedChainId = `0x${Number(Networks.current.chainId).toString(16)}`;
        this.apps.set(origin, app);
        resolve([account]);
      };

      const reject = () => {};

      PubSub.publish('openConnectInpageDApp', { approve, reject, origin, ...payload } as ConnectInpageDApp);
    });
  }

  private async wallet_switchEthereumChain(origin: string, params: { chainId: string }[]) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const targetChainId = params[0].chainId;
    if (!Networks.has(targetChainId)) return null;

    console.log('targetChainId', targetChainId);
    dapp.lastUsedChainId = targetChainId;

    this.emit('appStateUpdated', {
      type: 'STATE_UPDATE',
      payload: { origin, selectedAddress: dapp.lastUsedAccount, network: targetChainId },
    });

    return null;
  }
}

export default new InpageDAppHub();

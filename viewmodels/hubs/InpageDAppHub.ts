import App from '../App';
import Database from '../../models/Database';
import EventEmitter from 'events';
import InpageDApp from '../../models/InpageDApp';
import Networks from '../Networks';
import { rawCall } from '../../common/RPC';
import { utils } from 'ethers';

interface Payload {
  id?: string;
  jsonrpc?: string;
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

export interface InpageDAppSignRequest {
  type: 'plaintext' | 'typedData';
  chainId: number;
  msg?: string;
  typedData?: any;
  approve: (pin?: string) => Promise<boolean>;
  reject: () => void;
}

class InpageDAppHub extends EventEmitter {
  apps = new Map<string, InpageDApp>();

  get inpageDApps() {
    return Database.inpageDApps;
  }

  async handle(origin: string, payload: Payload) {
    const { method, params, __mmID, id, jsonrpc } = payload;
    let response: any;

    switch (method) {
      case 'eth_accounts':
        const account = (await this.getDApp(origin))?.lastUsedAccount;
        response = account ? [account] : [];
        break;
      case 'eth_requestAccounts':
        response = await this.eth_requestAccounts(origin, payload);
        break;
      case 'eth_chainId':
        response = `0x${Number(this.apps.get(origin)?.lastUsedChainId ?? Networks.current.chainId).toString(16)}`;
        break;
      case 'wallet_switchEthereumChain':
        response = await this.wallet_switchEthereumChain(origin, params);
        break;
      case 'personal_sign':
      case 'eth_sign':
      case 'sign_typedData':
        response = await this.sign(origin, params, method);
        break;
      case 'net_version':
        const app = this.apps.get(origin);
        if (app) {
          response = Number(app.lastUsedChainId);
          break;
        }
      default:
        const dapp = await this.getDApp(origin);
        if (dapp) response = await rawCall(dapp.lastUsedChainId, { method, params });
        break;
    }

    return JSON.stringify({ type: 'INPAGE_RESPONSE', payload: { id, jsonrpc, __mmID, error: undefined, response } });
  }

  private async getDApp(origin: string) {
    return this.apps.get(origin) || (await this.inpageDApps.findOne({ where: { origin } }));
  }

  private async eth_requestAccounts(origin: string, payload: Payload) {
    if (!App.currentWallet) return [];

    const dapp = await this.getDApp(origin);
    if (dapp) {
      this.apps.set(origin, dapp);
      const account = App.allAccounts.find((a) => a.address === dapp.lastUsedAccount); // Ensure last used account is still available
      return [account?.address ?? App.allAccounts[0].address];
    }

    return new Promise<string[] | any>((resolve) => {
      const approve = () => {
        const account = App.currentWallet?.currentAccount?.address!;
        const app = new InpageDApp();
        app.origin = origin;
        app.lastUsedAccount = account;
        app.lastUsedChainId = `0x${Number(Networks.current.chainId).toString(16)}`;
        this.apps.set(origin, app);
        resolve([account]);
      };

      const reject = () => resolve({ error: { code: 4001, message: 'User rejected' } });
      PubSub.publish('openConnectInpageDApp', { approve, reject, origin, ...payload } as ConnectInpageDApp);
    });
  }

  private async wallet_switchEthereumChain(origin: string, params: { chainId: string }[]) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const targetChainId = params[0].chainId;
    if (!Networks.has(targetChainId)) return null;

    dapp.lastUsedChainId = targetChainId;

    this.emit('appStateUpdated', {
      type: 'STATE_UPDATE',
      payload: { origin, selectedAddress: dapp.lastUsedAccount, network: targetChainId },
    });

    return null;
  }

  private async sign(origin: string, params: string[], method: string) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return;

    return new Promise((resolve) => {
      const approve = (pin?: string) => {};
      const reject = () => resolve(null);

      let msg: string | undefined = undefined;
      let typedData: any;
      let type: 'plaintext' | 'typedData' = 'plaintext';

      switch (method) {
        case 'eth_sign':
          msg = Buffer.from(utils.arrayify(params[1])).toString('utf8');
          type = 'plaintext';
          break;
        case 'personal_sign':
          msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
          type = 'plaintext';
          break;
        case 'eth_signTypedData':
          typedData = JSON.parse(params[1]);
          type = 'typedData';
          break;
      }

      PubSub.publish('openInpageDAppSign', {
        msg,
        typedData,
        type,
        approve,
        reject,
        chainId: Number(dapp.lastUsedChainId),
      } as InpageDAppSignRequest);
    });
  }
}

export default new InpageDAppHub();

import * as Linking from 'expo-linking';

import { Bytes, providers, utils } from 'ethers';
import Networks, { AddEthereumChainParameter } from '../Networks';

import { Account } from '../account/Account';
import App from '../App';
import Database from '../../models/Database';
import DeviceInfo from 'react-native-device-info';
import EventEmitter from 'events';
import { INetwork } from '../../common/Networks';
import InpageDApp from '../../models/InpageDApp';
import { ReadableInfo } from '../../models/Transaction';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';
import WebView from 'react-native-webview';
import i18n from '../../i18n';
import { rawCall } from '../../common/RPC';
import { showMessage } from 'react-native-flash-message';

const NOTIFICATION_NAMES = {
  accountsChanged: 'metamask_accountsChanged',
  unlockStateChanged: 'metamask_unlockStateChanged',
  chainChanged: 'metamask_chainChanged',
};

interface JsonRpcRequest {
  id?: number | string;
  jsonrpc: '2.0';
  method: string;
  params?: Array<any> | any;
}

interface JsonRpcResponse {
  id: string | undefined;
  jsonrpc: '2.0';
  method: string;
  result?: unknown;
  error?: Error;
}

interface Payload extends JsonRpcRequest {
  pageMetadata?: { icon: string; title: string; desc?: string };
}

interface WatchAssetParams {
  type: 'ERC20'; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    symbol: string; // A ticker symbol or shorthand, up to 5 characters
    decimals: number; // The number of token decimals
    image: string; // A string url of the token logo
  };
}

export interface ConnectInpageDApp extends Payload {
  origin: string;
  approve: (userSelected: { network: INetwork; account: Account }) => void;
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

export interface InpageDAppTxRequest {
  chainId: number;
  param: WCCallRequest_eth_sendTransaction;
  account: string;
  app: { name: string; icon: string };
  approve: (obj: { pin?: string; tx: providers.TransactionRequest; readableInfo: ReadableInfo }) => Promise<boolean>;
  reject: () => void;
}

export interface InpageDAppAddEthereumChain {
  approve: () => void;
  reject: () => void;
  chain: AddEthereumChainParameter;
}

export interface InpageDAppAddAsset {
  approve: () => void;
  reject: () => void;
  asset: WatchAssetParams;
}

class InpageMetamaskDAppHub extends EventEmitter {
  apps = new Map<string, InpageDApp>();

  private get dbTable() {
    return Database.inpageDApps;
  }

  constructor() {
    super();
  }

  async handle(origin: string, payload: Payload) {
    const { hostname } = Linking.parse(origin);
    const { method, params, id, jsonrpc } = payload;
    let result: any = null;

    switch (method) {
      case 'metamask_getProviderState':
        result = {
          isInitialized: true,
          isUnlocked: true,
          network: Networks.current.chainId,
          selectedAddress: App.currentAccount?.address!,
          accounts: [App.currentAccount?.address!],
        };
        break;
      case 'web3_clientVersion':
        result = `Wallet3/${DeviceInfo.getVersion()}/Mobile`;
        break;
      case 'eth_accounts':
        const account = (await this.getDApp(hostname!))?.lastUsedAccount;
        result = account ? [account] : [];
        break;
      case 'eth_coinbase':
        const coinbase = (await this.getDApp(hostname!))?.lastUsedAccount;
        result = account ? [coinbase] : null;
        break;
      case 'eth_requestAccounts':
        result = await this.eth_requestAccounts(hostname!, payload);
        break;
      case 'net_version':
        result = `${Number((await this.getDApp(hostname!))?.lastUsedChainId ?? 1)}`;
        break;
      case 'eth_chainId':
        result = `0x${Number((await this.getDApp(hostname!))?.lastUsedChainId ?? Networks.current.chainId).toString(16)}`;
        break;
      case 'wallet_switchEthereumChain':
        result = await this.wallet_switchEthereumChain(hostname!, params);
        break;
      case 'personal_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        result = await this.sign(hostname!, params, method);
        break;
      case 'eth_sign':
        result = { error: { message: 'eth_sign is not supported' } };
        break;
      case 'eth_sendTransaction':
        result = await this.eth_sendTransaction(hostname!, payload);
        break;
      case 'wallet_addEthereumChain':
        result = await this.wallet_addEthereumChain(hostname!, params);
        break;
      case 'wallet_watchAsset':
        result = await this.wallet_watchAsset(hostname!, params);
        break;
      case 'eth_getEncryptionPublicKey':
      case 'eth_decrypt':
        break;
      case 'personal_ecRecover':
        result = await this.personal_ecRecover(hostname!, params);
        break;
      default:
        const dapp = await this.getDApp(hostname!);
        if (dapp) result = await rawCall(dapp.lastUsedChainId, { method, params });
        break;
    }

    return {
      name: 'metamask-provider',
      data: { id, jsonrpc, error: undefined, result },
    };
    // return JSON.stringify({ id, jsonrpc, result, error: undefined });
  }

  async getDApp(hostname: string) {
    let dapp = this.apps.get(hostname);
    if (dapp) return dapp;

    dapp = await this.dbTable.findOne({ where: { origin: hostname } });
    if (dapp) this.apps.set(hostname, dapp);

    return dapp;
  }

  private async eth_requestAccounts(origin: string, payload: Payload) {
    if (!App.currentAccount) return [];

    const dapp = await this.getDApp(origin);

    if (dapp) {
      const account = App.allAccounts.find((a) => a.address === dapp.lastUsedAccount); // Ensure last used account is still available
      return [account?.address ?? App.allAccounts[0].address];
    }

    return new Promise<string[] | any>((resolve) => {
      const approve = ({ account, network }: { account: Account; network: INetwork }) => {
        const app = new InpageDApp();
        app.origin = origin;
        app.lastUsedAccount = account.address;
        app.lastUsedChainId = `0x${Number(network.chainId).toString(16)}`;
        this.apps.set(origin, app);
        resolve([account.address]);

        this.emit('dappConnected', app);
        app.save();
      };

      const reject = () => resolve({ error: { code: 4001, message: 'User rejected' } });
      PubSub.publish('openConnectInpageDApp', { approve, reject, origin, ...payload } as ConnectInpageDApp);
    });
  }

  private async wallet_switchEthereumChain(origin: string, params: { chainId: string }[]) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const targetChainId = params[0].chainId;
    if (Number(dapp.lastUsedChainId) === Number(targetChainId)) return null;
    if (!Networks.has(targetChainId)) return { error: { code: 4902, message: 'the chain has not been added to Wallet 3' } };

    this.setDAppChainId(origin, targetChainId);

    return null;
  }

  private async sign(origin: string, params: string[], method: string) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return;

    return new Promise((resolve) => {
      let msg: string | undefined = undefined;
      let typedData: any;
      let type: 'plaintext' | 'typedData' = 'plaintext';
      let typedVersion = SignTypedDataVersion.V4;

      const approve = async (pin?: string) => {
        const { wallet, accountIndex } = App.findWallet(dapp.lastUsedAccount) || {};
        if (!wallet || accountIndex === undefined) return resolve({ error: { code: 4001, message: 'Invalid account' } });

        const signed =
          type === 'typedData'
            ? await wallet.signTypedData({ typedData, pin, accountIndex, version: typedVersion })
            : await wallet.signMessage({ msg: msg!, pin, accountIndex });

        if (signed) resolve(signed);

        return signed ? true : false;
      };

      const reject = () => resolve({ error: { code: 1, message: 'User rejected' } });

      switch (method) {
        case 'personal_sign':
          msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
          type = 'plaintext';
          break;
        case 'eth_signTypedData':
          typedData = params[0];
          type = 'typedData';
          typedVersion = SignTypedDataVersion.V1;
          break;
        case 'eth_signTypedData_v3':
          typedData = JSON.parse(params[1]);
          type = 'typedData';
          typedVersion = SignTypedDataVersion.V3;
          break;
        case 'eth_signTypedData_v4':
          typedData = JSON.parse(params[1]);
          type = 'typedData';
          typedVersion = SignTypedDataVersion.V4;
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

  private async eth_sendTransaction(origin: string, payload: Payload) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const { params, pageMetadata } = payload;

    return new Promise<string | any>((resolve) => {
      const approve = async ({
        pin,
        tx,
        readableInfo,
      }: {
        pin?: string;
        tx: providers.TransactionRequest;
        readableInfo: ReadableInfo;
      }) => {
        const { wallet, accountIndex } = App.findWallet(dapp.lastUsedAccount) || {};
        if (!wallet) {
          showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
          return resolve({ error: { code: 4001, message: 'Invalid account' } });
        }

        const { txHex, error } = await wallet.signTx({
          tx,
          pin,
          accountIndex: accountIndex!,
        });

        if (!txHex || error) {
          if (error) showMessage({ type: 'warning', message: error.message });
          return false;
        }

        const broadcastTx = {
          txHex,
          tx,
          readableInfo: { ...(readableInfo || {}), dapp: pageMetadata?.title ?? '', icon: pageMetadata?.icon },
        };

        wallet.sendTx(broadcastTx).then((hash) => resolve(hash));

        return true;
      };

      const reject = () => resolve({ error: { code: 1, message: 'User rejected' } });

      PubSub.publish('openInpageDAppSendTransaction', {
        approve,
        reject,
        param: params[0] as WCCallRequest_eth_sendTransaction,
        chainId: Number(dapp.lastUsedChainId),
        account: dapp.lastUsedAccount,
        app: { name: pageMetadata!.title, icon: pageMetadata!.icon },
      } as InpageDAppTxRequest);
    });
  }

  private async wallet_addEthereumChain(origin: string, params: AddEthereumChainParameter[]) {
    if (!params || !params.length) return { error: { message: 'Invalid request' } };

    const chain = params[0];

    if (!Array.isArray(chain.rpcUrls) || !Array.isArray(chain.blockExplorerUrls) || !chain.nativeCurrency)
      return { error: { message: 'Invalid request' } };

    if (Networks.has(chain.chainId)) {
      setTimeout(() => this.wallet_switchEthereumChain(origin, [{ chainId: chain.chainId }]), 200);

      const dapp = await this.getDApp(origin);
      if (!dapp) return null;

      if (Number(dapp.lastUsedChainId) !== 1) {
        showMessage({ message: i18n.t('msg-chain-already-exists', { name: chain.chainName }), type: 'info' });
      }

      return null;
    }

    return new Promise((resolve) => {
      const approve = async () => {
        if (await Networks.add(chain))
          showMessage({ message: i18n.t('msg-chain-added', { name: chain.chainName }), type: 'success' });

        resolve(null);
        this.wallet_switchEthereumChain(origin, [{ chainId: chain.chainId }]);
      };

      const reject = () => {
        resolve({ error: { code: 1, message: 'User rejected' } });
      };

      PubSub.publish('openAddEthereumChain', {
        approve,
        reject,
        chain: params[0],
      } as InpageDAppAddEthereumChain);
    });
  }

  private async wallet_watchAsset(origin: string, asset: WatchAssetParams) {
    if (!asset || !asset.options || !asset.options.address || asset.type !== 'ERC20')
      return { error: { message: 'Invalid request' } };

    const dapp = await this.getDApp(origin);

    return new Promise((resolve) => {
      const approve = () => {
        const account = App.allAccounts.find((a) => a.address === dapp?.lastUsedAccount) ?? App.currentAccount;

        account?.tokens.addToken(
          {
            address: utils.getAddress(asset.options.address),
            decimals: asset.options.decimals,
            symbol: asset.options.symbol,
            iconUrl: asset.options.image,
            shown: true,
          },
          dapp ? Number(dapp?.lastUsedChainId) : undefined
        );

        showMessage({ message: i18n.t('msg-token-added', { name: asset.options.symbol }), type: 'success' });

        resolve(null);
      };

      const reject = () => {
        resolve(null);
      };

      PubSub.publish('openAddAsset', {
        asset,
        approve,
        reject,
      } as InpageDAppAddAsset);
    });
  }

  private async personal_ecRecover(origin: string, params: string[]) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return null;

    const [hexMsg, signature] = params;
    const msg = Buffer.from(utils.arrayify(hexMsg)).toString('utf-8');

    const address = utils.verifyMessage(msg, signature);
    return dapp.lastUsedAccount === address ? address : null;
  }

  async setDAppChainId(origin: string, chainId: string | number) {
    const dapp = await this.getDApp(origin);
    if (!dapp) return;

    dapp.lastUsedChainId = `${chainId}`;
    dapp.save();

    this.emit('appChainUpdated_metamask', {
      origin,
      name: 'metamask-provider',
      data: {
        method: NOTIFICATION_NAMES.chainChanged,
        jsonrpc: '2.0',
        params: { chainId: `0x${Number(chainId).toString(16)}`, networkVersion: `${chainId}` },
      },
    });
  }

  reset() {
    this.apps.clear();
    return this.dbTable.clear();
  }
}

export default new InpageMetamaskDAppHub();

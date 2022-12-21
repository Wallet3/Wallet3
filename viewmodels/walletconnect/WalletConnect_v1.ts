import Networks, { AddEthereumChainParameter } from '../core/Networks';
import WCSession_v1, {
  IRawWcSession,
  WCCallRequestRequest,
  WCClientMeta,
  WCSessionRequestRequest,
} from '../../models/WCSession_v1';
import { action, makeObservable, observable } from 'mobx';

import App from '../core/App';
import { EventEmitter } from 'events';
import { InpageDAppAddEthereumChain } from '../../screens/browser/controller/InpageDAppController';
import MessageKeys from '../../common/MessageKeys';
import PubSub from 'pubsub-js';
import WalletConnectClient from '@walletconnect/client';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

const clientMeta = {
  name: 'Wallet 3',
  description: 'A Secure Wallet for Web3 Era',
  icons: [],
  url: 'https://wallet3.io',
};

export class WalletConnect_v1 extends EventEmitter {
  private client!: WalletConnectClient;
  store?: WCSession_v1;

  readonly version = 1;
  peerId = '';
  appMeta: WCClientMeta | null = null;

  get session() {
    return this.client.session;
  }

  get lastUsedTimestamp() {
    return this.store?.lastUsedTimestamp ?? 0;
  }

  get isMobileApp() {
    return this.store?.isMobile ?? false;
  }

  get origin() {
    return this.store?.hostname ?? '';
  }

  get lastUsedChainId() {
    return this.store?.lastUsedChainId ?? '0x1';
  }

  get chains() {
    return [Number(this.lastUsedChainId)];
  }

  get lastUsedAccount() {
    return this.store?.lastUsedAccount ?? '';
  }

  get accounts() {
    return this.lastUsedAccount ? [this.lastUsedAccount] : [];
  }

  get activeAccount() {
    return App.findAccount(this.lastUsedAccount);
  }

  get activeNetwork() {
    return Networks.find(this.lastUsedChainId) || Networks.current;
  }

  constructor(uri?: string) {
    super();

    makeObservable(this, {
      appMeta: observable,
      setLastUsedAccount: action,
      setLastUsedChain: action,
    });

    if (uri) this.connect(uri);
  }

  connect(uri: string) {
    this.client = new WalletConnectClient({ uri, clientMeta });

    this.client.on('session_request', this.handleSessionRequest);
    this.client.on('call_request', this.handleCallRequest);
    this.client.on('disconnect', () => this.emit('disconnect'));

    return this;
  }

  connectSession(session: IRawWcSession) {
    this.client = new WalletConnectClient({ session, clientMeta });
    this.client.on('call_request', this.handleCallRequest);
    this.client.on('disconnect', () => this.emit('disconnect'));
    this.appMeta = session.peerMeta;
    this.peerId = session.peerId;

    return this;
  }

  private updateSession(session: { chainId?: number; accounts?: string[] }) {
    if (!this.client.connected) return;
    this.client?.updateSession(session as any);
  }

  setLastUsedChain(chainId: number, persistent = false, from: 'user' | 'inpage' = 'user') {
    this.updateSession({ chainId });

    if (!this.store) return;

    this.store.lastUsedChainId = `${chainId}`;
    if (persistent) this.store.save();

    this.emit('lastUsedChainChanged', chainId, from);
  }

  setLastUsedAccount(account: string, persistent = false) {
    this.updateSession({ accounts: [account] });
    if (!this.store) return;

    this.store.lastUsedAccount = account;

    if (persistent) this.store.save();
  }

  setStore(store: WCSession_v1) {
    this.store = store;

    if (!store.lastUsedChainId) {
      this.setLastUsedChain(Networks.current.chainId);
    }

    if (!store.lastUsedAccount) {
      this.setLastUsedAccount(App.currentAccount!.address);
    }

    return this;
  }

  private handleSessionRequest = (error: Error | null, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    const [{ peerMeta, peerId, chainId }] = request.params;
    this.peerId = peerId;
    this.appMeta = peerMeta;

    if (this.store) {
      if (Number.isInteger(chainId)) this.store.lastUsedChainId = `${chainId}`;
      this.store.lastUsedTimestamp = Date.now();
    }

    this.emit('sessionRequest');
  };

  approveSession = async () => {
    this.client.approveSession({ accounts: [this.lastUsedAccount], chainId: Number(this.lastUsedChainId) });
    this.emit('sessionApproved', this.client.session);
  };

  rejectSession = () => {
    this.client.rejectSession({ message: 'User cancelled' });
  };

  rejectRequest = (id: number, message: string) => {
    this.client.rejectRequest({ id, error: { message } });
  };

  approveRequest = (id: number, result: any) => {
    this.client.approveRequest({ id, result });
  };

  private handleCallRequest = async (error: Error | null, request: WCCallRequestRequest) => {
    if (error || !request) {
      this.emit('error', error);
      return;
    }

    if (this.activeAccount?.address !== this.lastUsedAccount || !this.lastUsedAccount) {
      this.rejectRequest(request.id, 'Not authorized');
      showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
      return;
    }

    switch (request.method as string) {
      case 'wallet_addEthereumChain':
        const [addChainParams] = (request.params as AddEthereumChainParameter[]) || [];

        if (!addChainParams) {
          this.rejectRequest(request.id, 'Invalid parameters');
          return;
        }

        if (Networks.has(addChainParams.chainId)) {
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.approveRequest(request.id, null);
          return;
        }

        const approve = async () => {
          PubSub.publish(MessageKeys.openLoadingModal);

          if ((await Networks.add(addChainParams)) === false) {
            this.rejectRequest(request.id, 'Client error occurs');
            return;
          }

          showMessage({ message: i18n.t('msg-chain-added', { name: addChainParams.chainName }), type: 'success' });
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.approveRequest(request.id, null);
        };

        const reject = () => this.rejectRequest(request.id, 'User rejected');

        PubSub.publish(MessageKeys.openAddEthereumChain, {
          approve,
          reject,
          chain: addChainParams,
        } as InpageDAppAddEthereumChain);
        return;
      case 'wallet_switchEthereumChain':
        const [switchChainParams] = (request.params as { chainId: string }[]) || [];
        if (!Networks.has(switchChainParams.chainId)) {
          this.rejectRequest(request.id, 'Chain not supported');
          return;
        }

        this.setLastUsedChain(Number(switchChainParams.chainId), true, 'inpage');
        this.approveRequest(request.id, null);
        return;
    }

    if (
      ![
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
      ].some((method) => request.method === method)
    ) {
      this.rejectRequest(request.id, 'Method not supported');
      return;
    }

    PubSub.publish(MessageKeys.wc_request, { client: this, request });

    this.emit('sessionUpdated');
  };

  dispose() {
    this.removeAllListeners();

    this.client?.off('session_request');
    this.client?.off('call_request');
    this.client?.off('disconnect');
    this.client?.off('transport_error');
    this.client?.off('transport_open');

    try {
      this.client?.transportClose();
    } catch (error) {}

    (this.client as any) = undefined;
    (this.approveSession as any) = undefined;
    (this.rejectSession as any) = undefined;
  }

  killSession() {
    try {
      return this.client?.killSession({ message: 'disconnect' });
    } catch (error) {}
  }
}

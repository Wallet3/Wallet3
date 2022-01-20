import WCSession_v1, {
  IRawWcSession,
  WCCallRequestRequest,
  WCClientMeta,
  WCSessionRequestRequest,
} from '../../models/WCSession_v1';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import App from '../App';
import { EventEmitter } from 'events';
import { INetwork } from '../../common/Networks';
import { ISessionStatus } from '@walletconnect/types';
import Networks from '../Networks';
import PubSub from 'pubsub-js';
import WalletConnectClient from '@walletconnect/client';

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
    return App.findAccount(this.lastUsedAccount) || App.currentAccount;
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

  setLastUsedChain(chainId: number, persistent = false) {
    this.updateSession({ chainId });
    if (!this.store) return;

    this.store.lastUsedChainId = `${chainId}`;

    if (persistent) this.store.save();
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
      return;
    }

    PubSub.publish('wc_request', { client: this, request });

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

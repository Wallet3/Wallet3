import WCSession_v1, {
  IRawWcSession,
  WCCallRequestRequest,
  WCClientMeta,
  WCSessionRequestRequest,
} from '../models/WCSession_v1';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { EventEmitter } from 'events';
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
  enabledChains: number[] = [1];

  get session() {
    return this.client.session;
  }

  constructor(uri?: string) {
    super();

    makeObservable(this, { appMeta: observable, enabledChains: observable, setChains: action });
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

    return this;
  }

  setChains(chains: number[]) {
    this.enabledChains = chains;
  }

  setStore(store: WCSession_v1) {
    this.store = store;
    runInAction(() => (this.enabledChains = store.chains.map((id) => Number(id))));
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
    this.enabledChains = [chainId ?? 1];

    this.emit('sessionRequest');
  };

  approveSession = async (accounts: string[]) => {
    this.client.approveSession({ accounts, chainId: this.enabledChains[0] });
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

    PubSub.publish('wc_request', { client: this, request });

    // const checkAccount = (from: string) => {
    //   if (from?.toLowerCase() === this.wallet.currentAddress.toLowerCase()) return true;
    //   this.connector.rejectRequest({ id: request.id, error: { message: 'Update session' } });
    //   this.updateSession();
    //   return false;
    // };

    console.log(request.method);
    console.log(request.params);

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

import WCSession_v1, {
  IRawWcSession,
  WCCallRequestRequest,
  WCClientMeta,
  WCSessionRequestRequest,
} from '../../models/WCSession_v1';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { Account } from '../account/Account';
import { EventEmitter } from 'events';
import { INetwork } from '../../common/Networks';
import { ISessionStatus } from '@walletconnect/types';
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
  accounts: string[] = [];

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

  get lastUsedAccount() {
    return this.store?.lastUsedAccount ?? '';
  }

  constructor(uri?: string) {
    super();

    makeObservable(this, {
      appMeta: observable,
      enabledChains: observable,
      accounts: observable,
      setChains: action,
      setAccounts: action,
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

  updateSession(session: { chainId?: number; accounts?: string[] }) {
    this.client?.updateSession(session as any);
  }

  updateChains(chains: number[], currentNetwork: INetwork) {
    const target = chains.find((c) => c === currentNetwork.chainId) ?? chains[0];

    this.updateSession({ chainId: target });
    this.setChains(chains);
  }

  updateAccounts(accounts: string[], currentAccount: string) {
    const target = accounts.find((a) => a === currentAccount) ?? accounts[0];

    this.updateSession({ accounts: [target] });
    this.setAccounts(accounts);
  }

  setChains(chains: number[]) {
    this.enabledChains = chains;

    if (!this.store) return;
    this.store.chains = chains;
    this.store.lastUsedTimestamp = Date.now();
    this.store.save();
  }

  setLastUsedChain(chainId: number) {
    this.updateSession({ chainId });
    if (!this.store) return;

    this.store.lastUsedChainId = `${chainId}`;
    this.store.lastUsedTimestamp = Date.now();
    this.store.save();
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts;

    if (!this.store) return;
    this.store.accounts = accounts;
    this.store.lastUsedTimestamp = Date.now();
    this.store.save();
  }

  setStore(store: WCSession_v1) {
    this.store = store;
    runInAction(() => {
      this.enabledChains = store.chains.map((id) => Number(id));
      this.accounts = store.accounts;
    });
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

    if (this.store) {
      this.store.lastUsedTimestamp = Date.now();
      this.store.save();
    }

    this.emit('sessionRequest');
  };

  approveSession = async () => {
    this.client.approveSession({ accounts: this.accounts, chainId: this.enabledChains[0] });
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

  findTargetNetwork({
    networks,
    requestChainId,
    defaultNetwork,
  }: {
    networks: INetwork[];
    requestChainId?: number;
    defaultNetwork: INetwork;
  }) {
    return (
      networks.find((n) => n.chainId === requestChainId) ??
      (this.enabledChains.includes(defaultNetwork.chainId)
        ? defaultNetwork
        : networks.find((n) => this.enabledChains[0] === n.chainId)) ??
      networks[0]
    );
  }

  private handleCallRequest = async (error: Error | null, request: WCCallRequestRequest) => {
    if (error || !request) {
      this.emit('error', error);
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

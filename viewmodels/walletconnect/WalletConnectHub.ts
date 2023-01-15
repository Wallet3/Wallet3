import * as Linking from 'expo-linking';

import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { Core } from '@walletconnect/core';
import Database from '../../models/Database';
import EventEmitter from 'events';
import LINQ from 'linq';
import WCSession_v1 from '../../models/entities/WCSession_v1';
import WCV2_Session from '../../models/entities/WCSession_v2';
import { WalletConnect2ProjectID } from '../../configs/secret';
import { WalletConnect_v1 } from './WalletConnect_v1';
import { WalletConnect_v2 } from './WalletConnect_v2';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { Web3Wallet as Web3WalletType } from '@walletconnect/web3wallet/dist/types/client';

const walletMeta = {
  name: 'Wallet 3',
  description: 'A Secure Wallet for Web3',
  icons: ['https://github.com/Wallet3/Wallet3/blob/main/assets/icon@128.rounded.png?raw=true'],
  url: 'https://wallet3.io',
};

type Topic = string;

class WalletConnectV1ClientHub extends EventEmitter {
  private walletconnect2!: Web3WalletType;

  clients: WalletConnect_v1[] = [];
  pendingV2Clients = new Map<Topic, WalletConnect_v2>();
  v2Clients = new Map<Topic, WalletConnect_v2>();

  get connectedCount() {
    return this.clients.length;
  }

  get sortedClients() {
    return LINQ.from(this.clients)
      .orderByDescending((i) => i.lastUsedTimestamp)
      .toArray();
  }

  constructor() {
    super();
    makeObservable(this, { clients: observable, sortedClients: computed, connectedCount: computed, reset: action });
  }

  async init() {
    // Restore sessions
    const sessions = await Database.wcV1Sessions.find();
    const cs = await Promise.all(
      sessions.map(async (sessionStore) => {
        const c = new WalletConnect_v1().connectSession(sessionStore.session).setStore(sessionStore);
        await sessionStore.save(); // Don't remove this code until v1.5
        return c;
      })
    );

    runInAction(() => {
      this.clients = cs;
      this.clients.forEach((client) => this.handleLifecycle(client));
      this.clients.filter((c) => c.lastUsedTimestamp < Date.now() - 1000 * 60 * 60 * 24 * 30).forEach((c) => c.killSession());
    });

    this.walletconnect2 = await Web3Wallet.init({
      core: new Core({ projectId: WalletConnect2ProjectID }),
      metadata: walletMeta,
    });

    this.walletconnect2.on('session_proposal', (proposal) =>
      this.pendingV2Clients.get(proposal?.params?.pairingTopic!)?.handleSessionProposal(proposal)
    );

    this.walletconnect2.on('session_request', (request) => this.v2Clients.get(request.topic)?.handleSessionRequest(request));
  }

  async connect(uri: string, extra?: { hostname?: string; fromMobile?: boolean }) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    switch (version) {
      case '1':
        let client: WalletConnect_v1;

        try {
          client = new WalletConnect_v1(uri);
        } catch (error) {
          return;
        }

        const store = new WCSession_v1();
        store.id = Date.now();
        client.setStore(store);

        client.once('sessionApproved', () => {
          runInAction(() => this.clients.push(client));

          store.session = client.session;
          store.lastUsedTimestamp = Date.now();

          store.isMobile = extra?.fromMobile ?? false;
          store.hostname = extra?.hostname ?? '';

          store.save();

          if (extra?.fromMobile) setTimeout(() => this.emit('mobileAppConnected', client), 100);
        });

        this.handleLifecycle(client);
        return client;
      case '2':
        const pairing = await this.walletconnect2.core.pairing.pair({ uri, activatePairing: true });
        const client_v2 = new WalletConnect_v2(this.walletconnect2);

        this.pendingV2Clients.set(pairing.topic, client_v2);
        client_v2.once('sessionApproved', () => {
          this.pendingV2Clients.delete(pairing.topic);
          this.v2Clients.set(client_v2.session.topic, client_v2);
        });

        return client_v2;
    }
  }

  private handleLifecycle(client: WalletConnect_v1) {
    client.on('sessionUpdated', () => {
      if (!client.store) return;
      client.store.lastUsedTimestamp = Date.now();
      client.store.save();
    });

    client.once('disconnect', () => {
      client.store?.remove?.();
      if (!this.clients.includes(client)) return;
      runInAction(() => (this.clients = this.clients.filter((c) => c !== client)));
    });
  }

  find(hostname: string) {
    return LINQ.from(this.clients.filter((c) => c.origin === hostname))
      .orderByDescending((i) => i.lastUsedTimestamp)
      .firstOrDefault();
  }

  reset() {
    this.clients.forEach((c) => {
      c.killSession();
      c.dispose();
    });

    this.clients = [];
  }
}

export default new WalletConnectV1ClientHub();

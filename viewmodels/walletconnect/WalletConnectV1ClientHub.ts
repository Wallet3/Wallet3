import * as Linking from 'expo-linking';

import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import App from '../App';
import Database from '../../models/Database';
import EventEmitter from 'events';
import LINQ from 'linq';
import Networks from '../Networks';
import WCSession_v1 from '../../models/WCSession_v1';
import { WalletConnect_v1 } from './WalletConnect_v1';

class WalletConnectV1ClientHub extends EventEmitter {
  clients: WalletConnect_v1[] = [];

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

  private async upgrade() {
    const legacyEntities = await Database.wcV1Sessions_legacy.find();
    await Promise.all(
      legacyEntities.map(async (e) => {
        const session = new WCSession_v1();
        session.id = e.id;
        session.session = e.session;
        session.chains = e.chains;
        session.accounts = e.accounts;
        session.lastUsedTimestamp = e.lastUsedTimestamp;
        session.lastUsedAccount = '';
        await session.save();
        return session;
      })
    );

    await Database.wcV1Sessions_legacy.clear();
  }

  async init() {
    await this.upgrade();

    // Notify dapps to switch current network
    autorun(() => {
      const { current } = Networks;

      const clients = this.clients.filter((c) => !c.isMobileApp).filter((c) => c.enabledChains.includes(current.chainId));
      clients.forEach((c) => c.updateSession({ chainId: current.chainId }));
    });

    // Notify dapps to update current account
    autorun(() => {
      const { currentWallet } = App;
      const { currentAccount } = currentWallet ?? {};
      if (!currentAccount) return;

      const clients = this.clients.filter((c) => c!.isMobileApp).filter((c) => c.accounts.includes(currentAccount.address));
      clients.forEach((c) => c.updateSession({ accounts: [currentAccount.address] }));
    });

    // Restore sessions
    const sessions = await Database.wcV1Sessions.find();
    runInAction(() => {
      this.clients = sessions.map((sessionStore) =>
        new WalletConnect_v1().connectSession(sessionStore.session).setStore(sessionStore)
      );

      this.clients.forEach((client) => this.handleLifecycle(client));
      this.clients.filter((c) => c.lastUsedTimestamp < Date.now() - 1000 * 60 * 60 * 24 * 60).forEach((c) => c.killSession());
    });
  }

  connect(uri: string, extra?: { hostname?: string; fromMobile?: boolean }) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
      const client = new WalletConnect_v1(uri);
      client.setAccounts([App.currentWallet!.currentAccount!.address!]);

      client.once('sessionApproved', () => {
        // runInAction(() => (this.clients = this.clients.concat(client)));
        runInAction(() => this.clients.push(client));

        const store = new WCSession_v1();
        store.id = Date.now();
        store.session = client.session;
        store.lastUsedTimestamp = Date.now();
        store.chains = client.enabledChains;
        store.accounts = client.accounts;
        store.isMobile = extra?.fromMobile ?? false;
        store.hostname = extra?.hostname ?? '';
        store.lastUsedAccount = client.accounts[0];
        store.lastUsedChainId = `${client.enabledChains[0]}`;

        store.save();
        client.setStore(store);

        if (extra?.fromMobile) setTimeout(() => this.emit('mobileAppConnected', client), 100);
      });

      this.handleLifecycle(client);
      return client;
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

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
    if (legacyEntities.length === 0) return;

    await Promise.all(
      legacyEntities.map(async (e) => {
        const session = new WCSession_v1();
        session.id = e.id;
        session.session = e.session;
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
    // reaction(
    //   () => Networks.current,
    //   () => {
    //     this.clients
    //       .filter((c) => !c.isMobileApp)
    //       .filter((c) => c.enabledChains.includes(Networks.current.chainId))
    //       .forEach((c) => c.setLastUsedChain(Networks.current.chainId));
    //   }
    // );

    // Notify dapps to update current account
    // reaction(
    //   () => App.currentAccount,
    //   () => {
    //     if (!App.currentAccount) return;

    //     this.clients
    //       .filter((c) => c!.isMobileApp)
    //       .filter((c) => c.accounts.includes(App.currentAccount!.address))
    //       .forEach((c) => c.setLastUsedAccount(App.currentAccount!.address));
    //   }
    // );

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
      this.clients.filter((c) => c.lastUsedTimestamp < Date.now() - 1000 * 60 * 60 * 24 * 60).forEach((c) => c.killSession());
    });
  }

  connect(uri: string, extra?: { hostname?: string; fromMobile?: boolean }) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
      const client = new WalletConnect_v1(uri);
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

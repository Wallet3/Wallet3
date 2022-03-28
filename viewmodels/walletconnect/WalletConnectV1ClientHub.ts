import * as Linking from 'expo-linking';

import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Database from '../../models/Database';
import EventEmitter from 'events';
import LINQ from 'linq';
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
  }

  connect(uri: string, extra?: { hostname?: string; fromMobile?: boolean }) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
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

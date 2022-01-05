import * as Linking from 'expo-linking';

import { action, autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import App from '../App';
import Database from '../../models/Database';
import { EventEmitter } from '../../utils/events';
import LINQ from 'linq';
import Networks from '../Networks';
import WCSession_v1 from '../../models/WCSession_v1';
import { WalletConnect_v1 } from '../WalletConnect_v1';

class DAppHub extends EventEmitter {
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
    // Notify dapps to switch current network
    autorun(() => {
      const { current } = Networks;

      const clients = this.clients.filter((c) => c.enabledChains.includes(current.chainId));
      clients.forEach((c) => c.updateSession({ chainId: current.chainId }));
    });

    // Notify dapps to update current account
    autorun(() => {
      const { currentWallet } = App;
      const { currentAccount } = currentWallet ?? {};
      if (!currentAccount) return;

      const clients = this.clients.filter((c) => c.accounts.includes(currentAccount.address));
      clients.forEach((c) => c.updateSession({ accounts: [currentAccount.address] }));
    });

    // Restore sessions
    const sessions = await Database.wcSessionV1Repository.find();
    runInAction(() => {
      this.clients = sessions.map((sessionStore) =>
        new WalletConnect_v1().connectSession(sessionStore.session).setStore(sessionStore)
      );

      this.clients.forEach((client) => this.handleLifecycle(client));
    });
  }

  connect(uri: string) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
      const client = new WalletConnect_v1(uri);
      client.setAccounts([App.currentWallet!.currentAccount!.address!]);

      client.once('sessionApproved', () => {
        runInAction(() => (this.clients = this.clients.concat(client)));

        const store = new WCSession_v1();
        store.id = Date.now();
        store.session = client.session;
        store.lastUsedTimestamp = Date.now();
        store.chains = client.enabledChains;
        store.accounts = client.accounts;

        store.save();
        client.setStore(store);
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

  reset() {
    this.clients.forEach((c) => {
      c.killSession();
      c.dispose();
    });

    this.clients = [];
  }
}

export default new DAppHub();

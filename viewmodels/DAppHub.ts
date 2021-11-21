import * as Linking from 'expo-linking';

import { IReactionDisposer, autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import App from './App';
import Database from '../models/Database';
import { EventEmitter } from '../utils/events';
import Networks from './Networks';
import WCSession_v1 from '../models/WCSession_v1';
import { WalletConnect_v1 } from './WalletConnect_v1';

class DAppHub extends EventEmitter {
  private disposer?: IReactionDisposer;

  clients: WalletConnect_v1[] = [];

  get connectedCount() {
    return this.clients.length;
  }

  constructor() {
    super();
    makeObservable(this, { clients: observable, connectedCount: computed });
  }

  async init() {
    const sessions = await Database.wcSessionV1Repository.find();

    autorun(() => {
      const { current } = Networks;

      const clients = this.clients.filter((c) => c.enabledChains.includes(current.chainId));
      clients.forEach((c) => c.updateSession({ chainId: current.chainId }));
    });

    autorun(() => {
      const { currentWallet } = App;
      const { currentAccount } = currentWallet ?? {};
      if (!currentAccount) return;

      const clients = this.clients.filter((c) => c.accounts.includes(currentAccount.address));
      clients.forEach((c) => c.updateSession({ accounts: [currentAccount.address] }));
    });

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
        store.id = Date.now() + Number.parseInt(`${Math.random() * 1000000}`);
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

  dispose() {
    this.disposer?.();
    this.disposer = undefined;
  }
}

export default new DAppHub();

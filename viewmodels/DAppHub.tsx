import * as Linking from 'expo-linking';

import { makeObservable, observable, runInAction } from 'mobx';

import Database from '../models/Database';
import { EventEmitter } from '../utils/events';
import WCSession_v1 from '../models/WCSession_v1';
import { WalletConnect_v1 } from './WalletConnect_v1';

class DAppHub extends EventEmitter {
  clients: WalletConnect_v1[] = [];

  get connectedCount() {
    return this.clients.length;
  }

  constructor() {
    super();
    makeObservable(this, { clients: observable });
  }

  async init() {
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
      client.once('sessionApproved', () => {
        runInAction(() => this.clients.push(client));

        const store = new WCSession_v1();
        store.id = Date.now();
        store.session = client.session;
        store.lastUsedTimestamp = Date.now();
        store.chains = client.enabledChains;

        store.save();
        client.setStore(store);
      });

      this.handleLifecycle(client);
      return client;
    }
  }

  private handleLifecycle(client: WalletConnect_v1) {
    client.once('disconnect', () => {
      client.store?.remove?.();
      runInAction(() => (this.clients = this.clients.filter((c) => c !== client)));
    });
  }
}

export default new DAppHub();

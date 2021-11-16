import * as Linking from 'expo-linking';

import { makeObservable, observable } from 'mobx';

import { EventEmitter } from '../utils/events';
import { WalletConnect_v1 } from './WalletConnect_v1';

class DAppHub extends EventEmitter {
  clients: WalletConnect_v1[] = [];

  constructor() {
    super();
    makeObservable(this, { clients: observable });
  }

  connect(uri: string) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
      const client = new WalletConnect_v1(uri);
      this.clients.push(client);
      return client;
    }
  }
}

export default new DAppHub();

import * as Linking from 'expo-linking';

import { WalletConnect_v1 } from './WalletConnect_v1';
import { makeObservable } from 'mobx';

class DAppHub {
  connectingClient?: WalletConnect_v1;

  constructor() {
    makeObservable(this, {});
  }

  connect(uri: string) {
    const linking = Linking.parse(uri);
    const [_, version] = linking.path?.split('@') ?? [];

    if (version === '1') {
      this.connectingClient = new WalletConnect_v1(uri);
    }
  }
}

export default new DAppHub();

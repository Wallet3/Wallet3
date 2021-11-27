import * as Linking from 'expo-linking';

import i18n from '../i18n';
import { showMessage } from 'react-native-flash-message';

class UrlHub {
  private lastHandled = 0;

  start() {
    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (url: string) => {
    if (!url) return false;

    const appSchemes = ['wallet3:', 'ledgerlive', 'dharma', 'huobiwallet', 'imtokenv2', 'tpoutside'];
    const supportedSchemes = ['ethereum', 'wc:', '0x'].concat(appSchemes);
    const scheme =
      supportedSchemes.find((schema) => url.toLowerCase().startsWith(schema)) || (url.endsWith('.eth') ? '0x' : undefined);

    if (!scheme) {
      if (Date.now() - this.lastHandled < 3000) return false;

      showMessage({ message: i18n.t('msg-invalid-qr-code'), type: 'warning' });
      this.lastHandled = Date.now();
      return false;
    }

    if (appSchemes.includes(scheme)) {
      try {
        const { queryParams } = Linking.parse(url);
        if (Object.getOwnPropertyNames(queryParams).length === 0) return; // ignore empty query params

        PubSub.publish(`CodeScan-wc:`, { data: queryParams.uri });
      } catch (error) {}
    } else {
      PubSub.publish(`CodeScan-${scheme}`, { data: url.replace('Ethereum', 'ethereum') });
    }

    return true;
  };
}

export default new UrlHub();

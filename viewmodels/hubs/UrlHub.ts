import * as Linking from 'expo-linking';

import Authentication from '../Authentication';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

class UrlHub {
  private lastHandled = 0;

  start() {
    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (url: string) => {
    if (!url) return false;

    const appSchemes = [
      'wallet3:',
      'ledgerlive:',
      'dharma:',
      'huobiwallet:',
      'imtokenv2:',
      'tpoutside:',
      'pillarwallet:',
      'celowallet:',
      'bitpie:',
      'abt:',
    ];
    
    const supportedSchemes = ['ethereum', 'wc:', '0x', 'wallet3sync:'].concat(appSchemes);
    const scheme =
      supportedSchemes.find((schema) => url.toLowerCase().startsWith(schema)) || (url.endsWith('.eth') ? '0x' : undefined);

    if (!scheme) {
      if (Date.now() - this.lastHandled < 3000) return false;

      showMessage({ message: i18n.t('msg-invalid-qr-code'), type: 'warning' });
      this.lastHandled = Date.now();
      return false;
    }

    if (!Authentication.appAuthorized) {
      if (scheme === 'wallet3sync:') {
      } else {
        return;
      }
    }

    if (appSchemes.includes(scheme)) {
      try {
        const { queryParams } = Linking.parse(url);
        if (Object.getOwnPropertyNames(queryParams).length === 0) return false; // ignore empty query params

        PubSub.publish(`CodeScan-wc:`, { data: queryParams.uri });
      } catch (error) {}
    } else {
      PubSub.publish(`CodeScan-${scheme}`, { data: url.replace('Ethereum', 'ethereum') });
    }

    return true;
  };
}

export default new UrlHub();

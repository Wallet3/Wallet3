import * as Linking from 'expo-linking';

import Authentication from '../Authentication';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

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

const urls = ['https'];

const supportedSchemes = ['ethereum', '0x', 'wc:', 'wallet3sync:'].concat(appSchemes).concat(urls);

class LinkHub {
  private lastHandled = 0;
  private handledWCUrls = new Set<string>();

  start() {
    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (url: string, extra?: { fromMobile?: boolean; hostname?: string }) => {
    if (!url) return false;
    if (this.handledWCUrls.has(url)) return false;

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

        this.handledWCUrls.add(url);

        const data = queryParams.key ? `${queryParams.uri}&key=${queryParams.key}` : `${queryParams.uri}`;

        PubSub.publish(`CodeScan-wc:`, { data, extra });
      } catch (error) {}
    } else {
      if (scheme === 'wc:') this.handledWCUrls.add(url);
      PubSub.publish(`CodeScan-${scheme}`, { data: url.replace('Ethereum', 'ethereum'), extra });
    }

    return true;
  };
}

export default new LinkHub();

import * as Linking from 'expo-linking';

import Authentication from '../Authentication';
import MessageKeys from '../../common/MessageKeys';
import i18n from '../../i18n';
import { isURL } from '../../utils/url';
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

const urls = ['https:'];

const supportedSchemes = ['ethereum', '0x', 'wc:', 'wallet3sync:'].concat(appSchemes).concat(urls);

class LinkHub {
  private lastHandled = 0;
  private handledWCUrls = new Set<string>();

  start() {
    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (uri: string, extra?: { fromMobile?: boolean; hostname?: string }): boolean => {
    if (!uri) return false;
    if (this.handledWCUrls.has(uri)) return false;

    const scheme =
      supportedSchemes.find((schema) => uri.toLowerCase().startsWith(schema)) || (uri.endsWith('.eth') ? '0x' : undefined);

    if (!scheme) {
      if (isURL(uri)) {
        PubSub.publish(MessageKeys.CodeScan_https, {
          data: uri.startsWith('https:') || uri.startsWith('http:') ? uri : `https://${uri}`,
          extra,
        });
        return true;
      }

      if (Date.now() - this.lastHandled < 3000) return false;

      showMessage({ message: i18n.t('msg-invalid-qr-code'), type: 'warning' });
      this.lastHandled = Date.now();
      return false;
    }

    if (!Authentication.appAuthorized) {
      if (scheme === 'wallet3sync:') {
      } else {
        showMessage({ message: i18n.t('tip-app-not-authorized'), type: 'warning' });
        return false;
      }
    }

    if (appSchemes.includes(scheme)) {
      try {
        const { queryParams } = Linking.parse(uri);
        if (Object.getOwnPropertyNames(queryParams).length === 0) return false; // ignore empty query params

        this.handledWCUrls.add(uri);

        const data = queryParams.key ? `${queryParams.uri}&key=${queryParams.key}` : `${queryParams.uri}`;

        PubSub.publish(MessageKeys.CodeScan_wc, { data, extra });
      } catch (error) {}
    } else {
      if (scheme === 'wc:') this.handledWCUrls.add(uri);
      PubSub.publish(`CodeScan-${scheme}`, { data: uri.replace('Ethereum', 'ethereum'), extra });
    }

    return true;
  };
}

export default new LinkHub();

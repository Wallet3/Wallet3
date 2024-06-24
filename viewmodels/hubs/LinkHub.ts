import * as Linking from 'expo-linking';

import { decode as decodeBase64, isValid as isBase64 } from 'js-base64';

import Authentication from '../auth/Authentication';
import MessageKeys from '../../common/MessageKeys';
import i18n from '../../i18n';
import { isDomain } from '../services/ens/DomainResolver';
import { isURL } from '../../utils/url';
import { showMessage } from 'react-native-flash-message';
import { utils } from 'ethers';

export const SupportedWCSchemes = [
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
  'metamask:',
];

const urls = ['https:'];

const supportedSchemes = ['ethereum', '0x', 'wc:', 'wallet3sync:'].concat(SupportedWCSchemes).concat(urls);

class LinkHub {
  private lastHandled = 0;
  private handledWalletConnectUrls = new Set<string>();

  start() {
    Linking.getInitialURL().then((url) => this.handleURL(url!));
    Linking.addEventListener('url', ({ url }) => this.handleURL(url));
  }

  handleURL = (uri: string, extra?: { fromMobile?: boolean; hostname?: string }): boolean => {
    if (!uri) return false;
    if (this.handledWalletConnectUrls.has(uri)) return false;

    if (uri.length === 64 && (utils.isBytesLike(uri) || utils.isBytesLike(`0x${uri}`))) {
      PubSub.publish(MessageKeys.CodeScan_64Length, { data: uri });
      return true;
    }

    if (isBase64(uri) && uri.length > 82) {
      const decoded64 = decodeBase64(uri);
      if (decoded64.length === 64 && (utils.isBytesLike(decoded64) || utils.isBytesLike(`0x${decoded64}`))) {
        PubSub.publish(MessageKeys.CodeScan_64Length, { data: decoded64 });
        return true;
      }
    }

    const uriLower = uri.toLowerCase();

    const scheme = supportedSchemes.find((schema) => uriLower.startsWith(schema)) || (isDomain(uriLower) ? '0x' : undefined);

    if (!scheme) {
      if (isURL(uri)) {
        PubSub.publish(MessageKeys.openBrowser);

        setTimeout(() => {
          PubSub.publish(MessageKeys.openUrl, {
            data: uriLower.startsWith('https:') || uriLower.startsWith('http:') ? uri : `https://${uri}`,
            extra,
          });
        }, 200);
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

    if (uriLower.startsWith('https://') || uriLower.startsWith('http://')) {
      PubSub.publish(MessageKeys.openBrowser);
      setTimeout(() => PubSub.publish(MessageKeys.openUrl, { data: uri }), 200);
      return true;
    }

    if (SupportedWCSchemes.includes(scheme)) {
      try {
        const { queryParams, hostname } = Linking.parse(uri);
        if (!queryParams || Object.getOwnPropertyNames(queryParams).length === 0) return false; // ignore empty query params

        if (scheme.startsWith('wallet3') && hostname === 'open' && queryParams.url) {
          PubSub.publish(MessageKeys.openBrowser);
          setTimeout(() => PubSub.publish(MessageKeys.openUrl, { data: queryParams.url }), 200);
          return true;
        }

        this.handledWalletConnectUrls.add(uri);

        const data = queryParams.key ? `${queryParams.uri}&key=${queryParams.key}` : `${queryParams.uri}`;

        PubSub.publish(MessageKeys.codeScan.walletconnect, { data, extra });
      } catch (error) {}
    } else {
      if (scheme === 'wc:') this.handledWalletConnectUrls.add(uri);
      PubSub.publish(`CodeScan-${scheme}`, { data: uri.replace('Ethereum', 'ethereum'), extra });
    }

    return true;
  };
}

export default new LinkHub();

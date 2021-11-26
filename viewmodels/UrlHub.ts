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
    const scheme = this.findScheme(url);

    if (!scheme) {
      if (Date.now() - this.lastHandled < 3000) return false;

      showMessage({ message: i18n.t('msg-invalid-qr-code'), type: 'warning' });
      this.lastHandled = Date.now();
      return false;
    }

    PubSub.publish(`CodeScan-${scheme}`, { data: url });

    return true;
  };

  findScheme(data: string) {
    const supportedSchemes = ['ethereum', 'wc:', '0x'];
    return (
      supportedSchemes.find((schema) => data.toLowerCase().startsWith(schema)) || (data.endsWith('.eth') ? '0x' : undefined)
    );
  }
}

export default new UrlHub();

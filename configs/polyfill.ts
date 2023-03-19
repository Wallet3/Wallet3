import 'text-encoding-polyfill';

import { polyfillWebCrypto } from 'expo-standard-web-crypto';

__DEV__ ? require('crypto') : polyfillWebCrypto();

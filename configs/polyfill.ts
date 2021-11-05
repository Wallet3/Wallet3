import * as Random from 'expo-random';

import { polyfillWebCrypto } from 'expo-standard-web-crypto';

polyfillWebCrypto();

if (!global.crypto) {
  const selfCrypto = {};

  const getRandomValues = (array: Array<any> | Buffer) => {
    let length = array.length;
    let random = Random.getRandomBytes(length);
    random.forEach((value, index) => {
      array[index] = value;
    });

    return array;
  };

  Object.defineProperty(selfCrypto, 'getRandomValues', {
    enumerable: false,
    value: getRandomValues,
    writable: false,
  });

  Object.defineProperty(global, 'crypto', {
    enumerable: true,
    value: selfCrypto,
    writable: false,
  });
}

import 'text-encoding-polyfill';

// import * as Crypto from 'expo-crypto';

// if (!global.crypto) {
//   const selfCrypto = {};

//   const getRandomValues = (array: Array<any> | Buffer) => {
//     const length = array.length;
//     const random = Crypto.getRandomBytes(length);

//     random.forEach((value, index) => (array[index] = value));
//     return array;
//   };

//   Object.defineProperty(selfCrypto, 'getRandomValues', {
//     enumerable: false,
//     value: getRandomValues,
//     writable: false,
//   });

//   Object.defineProperty(global, 'crypto', {
//     enumerable: true,
//     value: selfCrypto,
//     writable: false,
//   });
// }

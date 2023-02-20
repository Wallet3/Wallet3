import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';

import CryptoES from 'crypto-es';
import { createHash } from 'crypto';

export async function sha256(input: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

export function sha256Sync(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export async function md5(input: string) {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, input);
}

const JsonFormatter = {
  stringify: function (cipherParams: CryptoES.lib.CipherParams) {
    // create json object with ciphertext
    const jsonObj: any = { ct: cipherParams.ciphertext.toString(CryptoES.enc.Base64) }; // optionally add iv and salt

    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }

    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }

    // stringify json object
    return JSON.stringify(jsonObj);
  },

  parse: function (jsonStr: string) {
    // parse json string
    const jsonObj = JSON.parse(jsonStr); // extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoES.lib.CipherParams.create({ ciphertext: CryptoES.enc.Base64.parse(jsonObj.ct) }); // optionally extract iv and salt

    if (jsonObj.iv) {
      cipherParams.iv = CryptoES.enc.Hex.parse(jsonObj.iv);
    }

    if (jsonObj.s) {
      cipherParams.salt = CryptoES.enc.Hex.parse(jsonObj.s);
    }

    return cipherParams;
  },
};

export function encrypt(input: string, key: string) {
  return CryptoES.AES.encrypt(input, key, {
    format: JsonFormatter,
    iv: CryptoES.enc.Hex.parse(Buffer.from(Random.getRandomBytes(16)).toString('hex')),
  }).toString();
}

export function decrypt(encrypted: string, key: string): string {
  return CryptoES.AES.decrypt(encrypted, key, { format: JsonFormatter }).toString(CryptoES.enc.Utf8);
}

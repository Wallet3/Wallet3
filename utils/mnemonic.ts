import * as ethers from 'ethers';

const REGEX_JAPANESE = /[\u3000-\u303f]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uff00-\uff9f]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/;
const hasJapanese = (str: string) => REGEX_JAPANESE.test(str);

const REGEX_CHINESE =
  /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
const hasChinese = (str: string) => REGEX_CHINESE.test(str);

const REG_KOREAN = /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g;
const hasKorean = (str: string) => REG_KOREAN.test(str);

export enum SecretType {
  mnemonic = 0,
  privkey = 1,
  keystore = 2,
}

export function checkSecretType(secret: string) {
  if (ethers.utils.isValidMnemonic(secret)) return SecretType.mnemonic;
  if (hasJapanese(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.ja)) return SecretType.mnemonic;
  if (hasChinese(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.zh)) return SecretType.mnemonic;
  if (hasKorean(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.ko)) return SecretType.mnemonic;

  if ((secret.toLowerCase().startsWith('0x') && secret.length === 66) || secret.length === 64) return SecretType.privkey;

  return undefined;
}

export function langToWordlist(secret: string) {
  if (hasJapanese(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.ja)) return ethers.wordlists.ja;
  if (hasChinese(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.zh)) return ethers.wordlists.zh;
  if (hasKorean(secret) && ethers.utils.isValidMnemonic(secret, ethers.wordlists.ko)) return ethers.wordlists.ko;

  return ethers.wordlists.en;
}

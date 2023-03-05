import ExpoCrypto from 'expo-crypto';
import { randomBytes } from 'crypto';

export function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getSecureRandomBytes(size: number) {
  return __DEV__ ? randomBytes(size) : Buffer.from(ExpoCrypto.getRandomBytes(size));
}

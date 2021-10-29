import * as Crypto from 'expo-crypto';

export async function sha256(input: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

export const CipherAlgorithm = 'aes-256-cfb';

export type ClientInfo = {
  globalId: string;
  devtype: string;
  device: string;
  manufacturer: string;
  name: string;
  os: string;
  rn_os: 'ios' | 'android';
  osVersion: string;
};

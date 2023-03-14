import { AccountBase } from './AccountBase';

export class EOA extends AccountBase {
  readonly type = 'eoa';

  constructor(address: string, index: number, extra: { signInPlatform?: string }) {
    // address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    // address = '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'; // nick.eth
    // address = '0x23d09ed7a3f46270271f5b2e00bfb4aecf361160';
    // address = '0xf0e0F53bF0564C82A8046bfB58E009076aafaAa3'; // japanese artist
    // address = '0xC0c648e8a51Fa89141b2ff297C8cD3270ab93576'; // BSC nfts
    // address = '0x5164cF3b0C8C0FDfE4BCc9Cf4F1e8f7E39461A59';
    // address = '0x09528d637deb5857dc059dddE6316D465a8b3b69';
    // address = '0x8147806066FB0989A102259912c71CBc4B9a1880'; // avax nfts
    super(address, index, extra);
  }
}

import * as Tokens from '../../common/tokens';

import { fetchInfo } from './EtherscanPublicTag';

class TokenVerifier {
  private data = new Set<string>();

  constructor() {
    const names = Object.getOwnPropertyNames(Tokens);

    for (let name of names) {
      this.data.add(Tokens[name].address);
    }
  }

  async checkVerified(chainId: number, address: string) {
    if (!address) return true;
    if (this.data.has(address)) return true;

    const cloudTag = await fetchInfo(chainId, address);
    return cloudTag?.publicName && !cloudTag.dangerous ? true : false;
  }
}

export default new TokenVerifier();

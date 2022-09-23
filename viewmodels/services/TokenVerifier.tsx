import * as Tokens from '../../common/tokens';

class TokenVerifier {
  private data = new Set<string>();

  constructor() {
    const names = Object.getOwnPropertyNames(Tokens);

    for (let name of names) {
      this.data.add(Tokens[name].address);
    }
  }

  isVerified(address: string) {
    return this.data.has(address);
  }
}

export default new TokenVerifier();

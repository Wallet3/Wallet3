import Validator, { AsyncCheckFunction, SyncCheckFunction } from 'fastest-validator';

export interface EIP2612 {
  Permit: {};
  primaryType: 'Permit';
  domain: { name: string; version: string; chainId: string; verifyingContract: string };
  message: { owner: string; spender: string; value: string; nonce: string; deadline: string };
}

const EIP2612Schema = {
  primaryType: 'string',
  domain: {
    $$type: 'object',
    name: 'string',
    version: 'string',
    chainId: ['string', 'number'],
    verifyingContract: 'string',
  },
  message: {
    $$type: 'object',
    owner: 'string',
    spender: 'string',
    value: ['string', 'number'],
    nonce: ['string', 'number'],
    deadline: ['string', 'number'],
  },

  $$strict: false,
};

class EIP2612Checker {
  private v = new Validator();
  private checker!: SyncCheckFunction | AsyncCheckFunction;

  check(obj: any) {
    if (!this.checker) {
      this.checker = this.v.compile(EIP2612Schema);
    }

    const result = this.checker(obj);
    return result === true;
  }
}

export default new EIP2612Checker();

import Validator, { AsyncCheckFunction, SyncCheckFunction } from 'fastest-validator';

import { utils } from 'ethers';

export interface EIP2612 {
  primaryType: 'Permit';
  domain: { name: string; version: string; chainId: string; verifyingContract: string };
  message: { owner: string; spender: string; value: string; nonce: string; deadline: string };
}

const EIP2612Schema = {
  primaryType: { type: 'string', enum: ['Permit'] },
  domain: {
    $$type: 'object',
    name: 'string',
    version: 'string',
    chainId: ['string', 'number'],
    verifyingContract: {
      type: 'string',
      custom: (v: string, errors: any[]) => {
        if (!utils.isAddress(v)) {
          errors.push({ type: 'verifyingContract' });
          return v;
        }

        return utils.getAddress(v);
      },
    },
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
  private checker!: SyncCheckFunction | AsyncCheckFunction;
  private v = new Validator({
    useNewCustomCheckerFunction: true,
    messages: {
      verifyingContract: 'The verifyingContract must be a valid address',
    },
  });

  check(obj: any) {
    if (!this.checker) {
      this.checker = this.v.compile(EIP2612Schema);
    }

    const result = this.checker(obj);
    return result === true;
  }
}

export default new EIP2612Checker();

export const EIP2612Mock = JSON.parse(
  '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"domain":{"name":"USD Coin","version":"2","verifyingContract":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","chainId":1},"primaryType":"Permit","message":{"owner":"0xCF458738D9BcF51151Dc4D9D02ce5f4f84dC7974","spender":"0xE931B17106bA9A58C998408230d99260B9b1ecA8","value":"5000000000","nonce":0,"deadline":1672299419}}'
);

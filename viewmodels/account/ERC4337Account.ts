import { EOAAccount } from './EOAAccount';

export class ERC4337Account extends EOAAccount {
  readonly type: 'eoa' | 'erc4337' = 'erc4337';
}

import { AccountBase } from './AccountBase';

export class ERC4337Account extends AccountBase {
  readonly type = 'erc4337';

  activated = false;
}

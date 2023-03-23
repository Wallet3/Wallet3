import { BigNumber, BigNumberish } from 'ethers';

import { ITokenMetadata } from '../common/tokens';

export interface IFungibleToken extends ITokenMetadata {
  getBalance(setLoading?: boolean): Promise<BigNumber>;
  estimateGas(to: string, toOrData?: string | BigNumberish): Promise<{ gas?: number; error?: Error }>;
  setOwner(owner: string): void;
  allowance(owner: string, spender: string, force?: boolean): Promise<BigNumber>;
}

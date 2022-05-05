export * from './Ethereum';
export * from './Arbitrum';
export * from './Aurora';
export * from './Avalanche';
export * from './BNBChain';
export * from './Boba';
export * from './Celo';
export * from './Fantom';
export * from './Gnosis';
export * from './Heco';
export * from './Polygon';
export * from './Ronin';
export * from './zkSync';
export * from './Metis';
export * from './Optimism';
export * from './Harmony';
export * from './Moonriver';

import { BigNumberish } from '@ethersproject/bignumber';

export interface IToken {
  address: string;
  decimals: number;
  symbol: string;
  price?: number;
  balance?: BigNumberish;
  iconUrl?: string;
  name?: string;
  amount?: string;
  shown?: boolean;
  loading?: boolean;
}

import { ETH } from './Ethereum';

const zkSync_USDC = {
  address: '0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4',
  decimals: 6,
  symbol: 'USDC',
};

export const zkSyncPopularTokens = [zkSync_USDC];

export const zkSyncFeeTokens = [ETH, zkSync_USDC];

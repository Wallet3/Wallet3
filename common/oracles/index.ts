import { BigNumber, ethers, utils } from 'ethers';

import Arbitrum from './Arbitrum';
import BNBChain from './BNBChain';
import ChainLinkOracleABI from '../../abis/ChainLinkOracle.json';
import Ethereum from './Ethereum';
import Optimism from './Optimism';
import Polygon from './Polygon';
import { eth_call } from '../RPC';

const call = '0xfeaf968c';

const Chains = {
  1: Ethereum,
  42161: Arbitrum,
  10: Optimism,
  137: Polygon,
  56: BNBChain,
} as { [chain: number]: { [address: string]: { name: string; oracle: string } } };

export async function getTokenPrice(chainId: number, erc20: string) {
  if (!Chains[chainId]) return;

  const chain = Chains[chainId];
  const feed = chain[erc20];

  const result = await eth_call<string>(chainId, { to: feed.oracle, data: call });
  if (!result) return;

  const contract = new ethers.Contract(feed.oracle, ChainLinkOracleABI);
  const [_, price] = contract.interface.decodeFunctionResult('latestRoundData', result);

  return Number(utils.formatUnits(price, 8));
}

import { IToken } from '../tokens';
import { utils } from 'ethers';

const host = 'https://openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;

const nativeTokens = [
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  '0x471EcE3750Da237f93B8E339c536989b8978a438',
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', // Celo native
];

export async function getBalance(address: string, chain: chain) {
  try {
    const resp = await fetch(`${host}/v1/user/chain_balance?id=${address}&chain_id=${chain}`.toLowerCase());
    const data = (await resp.json()) as { usd_value: number };
    return data;
  } catch (error) {
    return undefined;
  }
}

export async function getTokens(address: string, chain: chain, is_all = false) {
  try {
    const resp = await fetch(`${host}/v1/user/token_list?id=${address}&chain_id=${chain}&is_all=${is_all}`.toLowerCase());
    const data = (await resp.json()) as ITokenBalance[];

    return data
      .filter((t) => utils.isAddress(t.id))
      .map<IToken>((t) => {
        return {
          address: utils.getAddress(t.id),
          decimals: t.decimals,
          symbol: (t.optimized_symbol?.length ?? 10) <= 4 ? t.optimized_symbol ?? t.symbol : t.symbol,
          price: t.price,
          amount: `${t.amount}`,
          iconUrl: t.logo_url,
        };
      })
      .filter((t) => nativeTokens.indexOf(t.address) === -1);
  } catch (error) {
    return [];
  }
}

export const DebankSupportedChains = new Map<number, string>();

export async function fetchChainsOverview(address: string) {
  try {
    const resp = await fetch(`${host}/v1/user/total_balance?id=${address}`.toLowerCase());
    const data = (await resp.json()) as ITotalBalance;

    for (let chain of data.chain_list) {
      DebankSupportedChains.set(Number(chain.community_id), chain.id);
    }

    return data;
  } catch (error) {
    return undefined;
  }
}

export interface ITokenBalance {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  display_symbol?: string;
  optimized_symbol?: string;
  decimals: number;
  logo_url?: string;
  price?: number;
  is_verified?: boolean;
  is_core?: boolean;
  is_wallet?: boolean;
  time_at?: number;
  amount: number;
}

interface ITotalBalance {
  total_usd_value: number;
  chain_list: IChainBalance[];
}

export interface IChainBalance {
  id: string;
  community_id: number;
  name: string;
  native_token_id: string;
  logo_url: string;
  wrapped_token_id: string;
  usd_value: number;
}

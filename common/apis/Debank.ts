import { IToken } from '../Tokens';
import { utils } from 'ethers';

const host = 'https://openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;

export async function getBalance(address: string, chain: chain) {
  try {
    const resp = await fetch(`${host}/v1/user/chain_balance?id=${address}&chain_id=${chain}`.toLowerCase());
    const data = (await resp.json()) as { usd_value: number };
    return data;
  } catch (error) {
    return { usd_value: 0 };
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
          symbol: t.symbol.length <= 4 ? t.symbol : t.optimized_symbol || t.symbol,
          price: t.price,
          amount: `${t.amount}`,
          iconUrl: t.logo_url,
        };
      });
  } catch (error) {
    return [];
  }
}

export async function fetchChainsOverview(address: string) {
  try {
    const resp = await fetch(`${host}/v1/user/total_balance?id=${address}`.toLowerCase());
    const data = (await resp.json()) as ITotalBalance;
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

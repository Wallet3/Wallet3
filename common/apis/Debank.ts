import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeBankApiKey } from '../../configs/secret';
import { IToken } from '../tokens';
import { utils } from 'ethers';

const host = 'https://pro-openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;
type ChainBalance = { usd_value: number };

const nativeTokens = [
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  '0x471EcE3750Da237f93B8E339c536989b8978a438',
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', // Celo native
  '0x4200000000000000000000000000000000000006', // Boba network
];

const DAY = 24 * 60 * 60 * 1000;

const CacheKeys = {
  overview: 'Debank_overview',
  user_tokens: (chainId: number, address: string) => `Debank_tokens_${chainId}_${address.toLowerCase()}`,
  chain_balance: (chainId: number, address: string) => `Debank_chainBalance_${chainId}_${address.toLowerCase()}`,
};

export const DebankSupportedChains = new Map<number, string>();

export function clearBalanceCache(address: string, chainId: number) {
  return AsyncStorage.removeItem(CacheKeys.chain_balance(chainId, address));
}

export async function getBalance(address: string, chainId: number, debankId: chain) {
  let debankChainBalance: ChainBalance | undefined;

  do {
    try {
      const cacheJson = await AsyncStorage.getItem(CacheKeys.chain_balance(chainId, address));

      if (cacheJson) {
        const { timestamp, data } = JSON.parse(cacheJson) as { timestamp: number; data: ChainBalance };
        if (!Number.isNaN(data?.usd_value)) debankChainBalance = data;

        if (timestamp + 1 * 60 * 60 * 1000 > Date.now()) break;
      }
    } catch (error) {}

    try {
      const resp = await fetch(
        `${host}/v1/user/chain_balance?id=${address}&chain_id=${DebankSupportedChains.get(chainId) || debankId}`.toLowerCase(),
        { headers: { accept: 'application/json', AccessKey: DeBankApiKey } }
      );

      const data = (await resp.json()) as ChainBalance;
      debankChainBalance = data;

      await AsyncStorage.setItem(CacheKeys.chain_balance(chainId, address), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  return debankChainBalance;
}

export async function getTokens(address: string, chainId: number, debankId: chain, is_all = false) {
  let debankTokens: ITokenBalance[] | undefined;

  do {
    try {
      const cacheJson = await AsyncStorage.getItem(CacheKeys.user_tokens(chainId, address));

      if (cacheJson) {
        const { timestamp, data } = JSON.parse(cacheJson) as { timestamp: number; data: ITokenBalance[] };
        if (Array.isArray(data)) debankTokens = data;
        if (timestamp + 2 * DAY > Date.now()) break;
      }
    } catch (error) {}

    try {
      const resp = await fetch(
        `${host}/v1/user/token_list?id=${address}&chain_id=${
          DebankSupportedChains.get(chainId) || debankId
        }&is_all=${is_all}`.toLowerCase(),
        { headers: { accept: 'application/json', AccessKey: DeBankApiKey } }
      );
      const data = (await resp.json()) as ITokenBalance[];
      if (!Array.isArray(data)) break;

      debankTokens = data;
      await AsyncStorage.setItem(CacheKeys.user_tokens(chainId, address), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  return debankTokens
    ? debankTokens
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
        .filter((t) => nativeTokens.indexOf(t.address) === -1)
    : [];
}

export async function fetchChainsOverview(address: string) {
  let debankOverview: ITotalBalance | undefined;

  do {
    const cacheJson = await AsyncStorage.getItem(CacheKeys.overview);

    if (cacheJson) {
      try {
        const { timestamp, data } = JSON.parse(cacheJson) as {
          timestamp: number;
          data: ITotalBalance;
        };

        debankOverview = data;
        if (timestamp + 7 * DAY > Date.now()) break;
      } catch (error) {}
    }

    try {
      const resp = await fetch(`${host}/v1/user/total_balance?id=${address}`.toLowerCase(), {
        headers: { accept: 'application/json', AccessKey: DeBankApiKey },
      });

      const data = (await resp.json()) as ITotalBalance;
      if (!Array.isArray(data.chain_list)) break;

      debankOverview = data;
      await AsyncStorage.setItem(CacheKeys.overview, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  if (!debankOverview) return;

  for (let chain of debankOverview.chain_list) {
    DebankSupportedChains.set(Number(chain.community_id), chain.id);
  }

  return debankOverview;
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

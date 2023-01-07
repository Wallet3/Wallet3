import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeBankApiKey } from '../../configs/secret';
import { IToken } from '../tokens';
import { post } from '../../utils/fetch';
import { utils } from 'ethers';

const host = 'https://pro-openapi.debank.com';
type chain = 'eth' | 'bsc' | 'xdai' | 'matic' | string;
type ChainBalance = { usd_value: number };

const nativeTokens = [
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  '0x471EcE3750Da237f93B8E339c536989b8978a438',
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', // Celo native
  '0x4200000000000000000000000000000000000006', // Boba network
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dEaD',
  '0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD',
];

const DAY = 24 * 60 * 60 * 1000;

const CacheKeys = {
  overview: 'Debank_overview',
  user_tokens: (chainId: number, address: string) => `Debank_tokens_${chainId}_${address.toLowerCase()}`,
  user_nfts: (chainId: number, address: string) => `Debank_nfts_${chainId}_${address.toLowerCase()}`,
  chain_balance: (chainId: number, address: string) => `Debank_chainBalance_${chainId}_${address.toLowerCase()}`,
  pre_exec_tx: ({ chainId, to, from, data }: { chainId: number; from: string; to: string; data: string }) =>
    `${chainId}_${from}_${to}_${data}`,
};

const MemoryCache = new Map<string, any>();

export const DebankSupportedChains = new Map<number, string>();

export function clearBalanceCache(address: string, chainId: number) {
  MemoryCache.delete(CacheKeys.chain_balance(chainId, address));
  return AsyncStorage.removeItem(CacheKeys.chain_balance(chainId, address));
}

export async function getBalance(address: string, chainId: number, debankId?: chain) {
  if (MemoryCache.has(CacheKeys.chain_balance(chainId, address))) {
    return MemoryCache.get(CacheKeys.chain_balance(chainId, address)) as ChainBalance;
  }

  if (DebankSupportedChains.size > 0 && !DebankSupportedChains.get(chainId)) return { usd_value: 0 };

  let debankChainBalance: ChainBalance | undefined;

  do {
    try {
      const cacheJson = await AsyncStorage.getItem(CacheKeys.chain_balance(chainId, address));

      if (cacheJson) {
        const { timestamp, data } = JSON.parse(cacheJson) as { timestamp: number; data: ChainBalance };
        if (!Number.isNaN(data?.usd_value)) debankChainBalance = data;

        if (timestamp + 1 * DAY > Date.now()) break;
        if (data) MemoryCache.set(CacheKeys.chain_balance(chainId, address), data);
      }
    } catch (error) {}

    try {
      const resp = await fetch(
        `${host}/v1/user/chain_balance?id=${address}&chain_id=${DebankSupportedChains.get(chainId) || debankId}`.toLowerCase(),
        { headers: { accept: 'application/json', AccessKey: DeBankApiKey } }
      );

      const data = (await resp.json()) as ChainBalance;
      if (Number.isNaN(data?.usd_value)) break;

      debankChainBalance = data;
      MemoryCache.set(CacheKeys.chain_balance(chainId, address), debankChainBalance);
      await AsyncStorage.setItem(CacheKeys.chain_balance(chainId, address), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  return MemoryCache.get(CacheKeys.chain_balance(chainId, address)) || debankChainBalance;
}

export async function getTokens(address: string, chainId: number, debankId?: chain, is_all = false) {
  if (MemoryCache.has(CacheKeys.user_tokens(chainId, address))) {
    return MemoryCache.get(CacheKeys.user_tokens(chainId, address)) as IToken[];
  }

  if (DebankSupportedChains.size > 0 && !DebankSupportedChains.get(chainId)) return [];

  let debankTokens: ITokenBalance[] | undefined;

  do {
    try {
      const cacheJson = await AsyncStorage.getItem(CacheKeys.user_tokens(chainId, address));

      if (cacheJson) {
        const { timestamp, data } = JSON.parse(cacheJson) as { timestamp: number; data: ITokenBalance[] };
        if (Array.isArray(data)) debankTokens = data;
        if (timestamp + 3 * DAY > Date.now()) break;
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

  const result = debankTokens
    ? debankTokens
        .filter((t) => utils.isAddress(t.id))
        .map<IToken>((t) => {
          return {
            address: utils.getAddress(t.id),
            decimals: t.decimals,
            symbol: (t.optimized_symbol?.length ?? 10) <= 4 ? t.optimized_symbol ?? t.symbol : t.symbol,
            price: t.price,
            amount: `${t.amount}`,
            logoURI: t.logo_url,
          };
        })
        .filter((t) => nativeTokens.indexOf(t.address) === -1)
    : [];

  MemoryCache[CacheKeys.user_tokens(chainId, address)] = result.length > 0 ? result : undefined;

  return result;
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
        if (timestamp + 15 * DAY > Date.now()) break;
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

export async function getNfts(address: string, chainId: number) {
  if (DebankSupportedChains.size > 0 && !DebankSupportedChains.get(chainId)) return [];

  const comm_id = DebankSupportedChains.get(chainId);
  let nfts: DebankNFT[] = [];

  do {
    try {
      const cacheJson = await AsyncStorage.getItem(CacheKeys.user_nfts(chainId, address));
      if (cacheJson) {
        const { timestamp, data } = JSON.parse(cacheJson) as { timestamp: number; data: DebankNFT[] };
        if (Array.isArray(data)) nfts = data;
        if (timestamp + 1 * DAY > Date.now()) break;
      }
    } catch (error) {}

    try {
      const resp = await fetch(
        `https://pro-openapi.debank.com/v1/user/nft_list?id=${address}&chain_id=${comm_id}&is_all=true`.toLowerCase(),
        { headers: { accept: 'application/json', AccessKey: DeBankApiKey } }
      );

      const data = (await resp.json()) as DebankNFT[];
      if (!Array.isArray(data)) break;

      nfts = data;
      await AsyncStorage.setItem(CacheKeys.user_nfts(chainId, address), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  return nfts;
}

export async function preExecTx(tx: {
  from: string;
  to: string;
  chainId: number;
  value: string;
  data: string;
  nonce: string;
  gas: string;
}) {
  if (MemoryCache.has(CacheKeys.pre_exec_tx(tx))) {
    return MemoryCache.get(CacheKeys.pre_exec_tx(tx)) as PreExecResult;
  }

  try {
    const data: PreExecTx = await post(`${host}/v1/wallet/pre_exec_tx`, { tx }, { AccessKey: DeBankApiKey });

    const fixToken = (t: any) => {
      return {
        ...t,
        id: t.id.length === 42 ? t.id : '',
        chainId: tx.chainId,
        address: t.id.length === 42 ? t.id : '',
      } as TokenList;
    };

    const result: PreExecResult = {
      success: data.pre_exec?.success ?? false,
      receive_nft_list: data.balance_change.receive_nft_list,
      send_nft_list: data.balance_change.send_nft_list,
      receive_token_list: data.balance_change.receive_token_list.map(fixToken),
      send_token_list: data.balance_change.send_token_list.filter((t) => t.amount > 0).map(fixToken),
    };

    MemoryCache.set(CacheKeys.pre_exec_tx(tx), result);

    return result;
  } catch (error) {
    console.log(error);
  }

  return null;
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

interface TokenList {
  chainId: number;
  address: string;
  symbol: string;
  amount: number;

  id?: string;
  chain?: string;
  name?: string;
  display_symbol?: any;
  optimized_symbol?: string;
  decimals?: number;
  logo_url?: string;
  protocol_id?: string;
  price?: number;
  is_verified?: boolean;
  is_core?: boolean;
  is_wallet?: boolean;
  time_at?: any;
  usd_value?: number;
}

interface NftList {
  amount: number;
  chain: string;
  collection?: any;
  content: string;
  content_type: string;
  contract_id: string;
  description: string;
  detail_url: string;
  id: string;
  inner_id: string;
  name: string;
  total_supply: number;
}

interface BalanceChange {
  success: boolean;
  error?: any;
  send_token_list: TokenList[];
  receive_token_list: TokenList[];
  send_nft_list: NftList[];
  receive_nft_list: NftList[];
  usd_value_change: number;
}

interface Gas {
  success: boolean;
  error?: any;
  gas_used: number;
}

interface PreExec {
  success: boolean;
  error?: any;
}

interface PreExecTx {
  balance_change: BalanceChange;
  gas: Gas;
  is_multisig: boolean;
  multisig?: any;
  pre_exec: PreExec;
}

export interface PreExecResult {
  success: boolean;
  send_token_list?: TokenList[];
  receive_token_list?: TokenList[];
  send_nft_list?: NftList[];
  receive_nft_list?: NftList[];
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTPayToken {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  display_symbol?: any;
  optimized_symbol: string;
  decimals: number;
  logo_url: string;
  protocol_id: string;
  price: number;
  is_verified: boolean;
  is_core: boolean;
  is_wallet: boolean;
  time_at: number;
  amount: number;
  date_at: string;
}

export interface DebankNFT {
  id: string;
  contract_id: string;
  inner_id: string;
  chain: string;
  name: string;
  description: string;
  content_type: string;
  content: string;
  thumbnail_url: string;
  total_supply: number;
  detail_url: string;
  attributes: NFTAttribute[];
  collection_id: string;
  pay_token: NFTPayToken;
  contract_name: string;
  is_erc1155: boolean;
  amount: number;
  usd_price: number;
  is_erc721?: boolean;
}

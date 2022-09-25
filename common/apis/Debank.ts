import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeBankApiKey } from '../../configs/secret';
import { IToken } from '../tokens';
import axios from 'axios';
import { post } from '../../utils/fetch';
import { sleep } from '../../utils/async';
import { t } from 'i18n-js';
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
  chain_balance: (chainId: number, address: string) => `Debank_chainBalance_${chainId}_${address.toLowerCase()}`,
  pre_exec_tx: ({ chainId, to, from, data }: { chainId: number; from: string; to: string; data: string }) =>
    `${chainId}_${from}_${to}_${data}`,
};

const MemoryCache = new Map<string, any>();

export const DebankSupportedChains = new Map<number, string>();

export function clearBalanceCache(address: string, chainId: number) {
  MemoryCache.set(CacheKeys.chain_balance(chainId, address), undefined);
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
      await AsyncStorage.setItem(CacheKeys.chain_balance(chainId, address), JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {}
  } while (false);

  MemoryCache[CacheKeys.chain_balance(chainId, address)] = debankChainBalance;

  return debankChainBalance;
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
            iconUrl: t.logo_url,
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
      success: data.pre_exec.success,
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

const mock = {
  receive_token_list: [
    {
      chainId: 1,
      amount: 101.37034039854382,
      chain: 'eth',
      decimals: 18,
      display_symbol: null,
      id: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
      address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
      is_core: true,
      is_verified: true,
      is_wallet: true,
      logo_url:
        'https://static.debank.com/image/eth_token/logo_url/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72/034d454d78d7be7f9675066fdb63e114.png',
      name: 'Ethereum Name Service',
      optimized_symbol: 'ENS',
      price: 12.834153415017676,
      protocol_id: '',
      symbol: 'ENS',
      time_at: 1635800117,
      usd_value: 1301.0025004074755,
    },
    { chainId: 1, symbol: 'CRV', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', amount: 500 },
    { chainId: 1, symbol: 'MKR', address: '0x6B175474E89094C44Da98b954EedeAC495271d1F', amount: 500 },
    { chainId: 1, symbol: 'UNI', address: '0x6B175474E89094C44Da98b954EedeAC495271d2F', amount: 500 },
    { chainId: 1, symbol: 'SNX', address: '0x6B175474E89094C44Da98b954EedeAC495221d0F', amount: 500 },
    { chainId: 1, symbol: 'TUSD', address: '0x6Bc75474E89094C44Da98b954EedeAC495271d0F', amount: 500 },
    { chainId: 1, symbol: 'LINK', address: '0x6Bc75479E89094C44Da98b954EedeAC495271d0F', amount: 500 },
  ],
  send_token_list: [
    {
      chainId: 1,
      amount: 1,
      chain: 'eth',
      decimals: 18,
      display_symbol: null,
      id: '',
      address: '',
      is_core: true,
      is_verified: true,
      is_wallet: true,
      logo_url: 'https://static.debank.com/image/token/logo_url/eth/935ae4e4d1d12d59a99717a24f2540b5.png',
      name: 'ETH',
      optimized_symbol: 'ETH',
      price: 1303.42,
      protocol_id: '',
      symbol: 'ETH',
      time_at: 1483200000,
      usd_value: 1303.42,
    },
    { chainId: 1, symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', amount: 500 },
    { chainId: 1, symbol: 'USDC', address: '0x6B175474E89094C44Da98b954EedeAC495271d0c', amount: 500 },
    { chainId: 1, symbol: 'USDT', address: '0x6B175474E89094C44Da98b954EedeAC495271d0b', amount: 500 },
  ],
  send_nft_list: [
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content:
        'https://static.debank.com/image/eth_nft/local_url/aeee5dc9285c12b282aaf30839e61c6c/11972a026a9727482c793134e0f863dc',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content:
        'https://i.seadn.io/gae/XVLhukxRl3LOWQiXXU1IxgWa7sYHoOE4RYZAyf2GRcQi-NSVagMp6dBw4kuhXxQveslLwsEvXMmE4C17PMUqPoxHVOn8uU9OsFXi?w=500&auto=format',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content:
        'https://i.seadn.io/gae/WxvXgSfdXI3TaV5uPXYJy17_OYvhqY0mg4-zM2hfB6ny8vYVisOI1OeS-bb9jOQ1eZhkrSnx7A_sCX3bdt9TxoI5UTpV1c3i4gCu?w=500&auto=format',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content: 'https://img.seadn.io/files/c2157ada835b6d0c548beacfaed99c42.png?fit=max',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
  ],
  receive_nft_list: [
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content: 'https://storage.kumaleon.com/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207.png',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content:
        'https://i.seadn.io/gae/XVLhukxRl3LOWQiXXU1IxgWa7sYHoOE4RYZAyf2GRcQi-NSVagMp6dBw4kuhXxQveslLwsEvXMmE4C17PMUqPoxHVOn8uU9OsFXi?w=500&auto=format',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content:
        'https://i.seadn.io/gae/WxvXgSfdXI3TaV5uPXYJy17_OYvhqY0mg4-zM2hfB6ny8vYVisOI1OeS-bb9jOQ1eZhkrSnx7A_sCX3bdt9TxoI5UTpV1c3i4gCu?w=500&auto=format',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
    {
      amount: 1,
      chain: 'eth',
      collection: null,
      content: 'https://img.seadn.io/files/c2157ada835b6d0c548beacfaed99c42.png?fit=max',
      content_type: 'image_url',
      contract_id: '0x8270fc3b2d23de703b265b2abe008883954fea8e',
      description: '',
      detail_url: 'https://opensea.io/assets/0x8270fc3b2d23de703b265b2abe008883954fea8e/1207',
      id: 'ef900de9342d82b8cc30b2d765a20d1b',
      inner_id: '1207',
      name: 'KUMALEON EGG #1207',
      total_supply: 1,
    },
  ],
  success: true,
};

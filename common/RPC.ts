import { BigNumber, BigNumberish } from 'ethers';

import Networks from '../viewmodels/core/Networks';
import Providers from '../configs/providers.json';
import { PublicNetworks } from './Networks';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { post } from '../utils/fetch';

const cache = new Map<number, string[]>();
const failedRPCs = new Map<number, Set<string>>();
const MinWei = new Map(PublicNetworks.map((i) => [i.chainId, i.minWei || 0]));

export function getRPCUrls(chainId: number | string): string[] {
  if (cache.has(Number(chainId))) return cache.get(Number(chainId)) || [];

  let urls: string[] = Providers[`${Number(chainId)}`]?.filter((p) => p.startsWith('http')) ?? [];

  const network = Networks.find(chainId);
  const failed = failedRPCs.get(Number(chainId));

  urls.unshift(...(network?.rpcUrls ?? []));

  const availableUrls = urls.filter((url) => !(failed?.has(url) ?? false));
  urls = Array.from(new Set(availableUrls.length === 0 ? urls : availableUrls));

  if (urls.length === 0) return [];

  cache.set(Number(chainId), urls);
  return urls;
}

export function deleteRPCUrlCache(chainId: number | string) {
  cache.delete(Number(chainId));
}

function markRPCFailed(chainId: number | string, rpc: string) {
  let cache = failedRPCs.get(Number(chainId));

  if (!cache) {
    cache = new Set();
    failedRPCs.set(Number(chainId), cache);
  }

  cache.add(rpc);
}

export async function getBalance(chainId: number, address: string): Promise<BigNumber> {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const result = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: Date.now(),
      });

      if (result.error) continue;

      return BigNumber.from(result.result);
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return BigNumber.from(0);
}

export async function sendTransaction(chainId: number, txHex: string) {
  const urls = getRPCUrls(chainId);
  let error: { code: number; message: string } | undefined = undefined;

  const eth_sendRawTransaction = (url: string) =>
    post(url, {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [txHex],
      id: Date.now(),
    });

  for (const url of urls) {
    try {
      const resp = (await eth_sendRawTransaction(url)) as {
        id: number;
        result: string;
        error: { code: number; message: string };
      };

      if (resp.error) {
        error = resp.error;
        continue;
      }

      return resp;
    } catch {}
  }

  return { error, id: 0, result: undefined };
}

export async function getTransactionCount(chainId: number, address: string) {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'pending'],
        id: Date.now(),
      });

      const { result, error } = resp as { id: number; result: string; error: any };
      if (error) continue;

      return Number.parseInt(result) || 0;
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return 0;
}

export async function eth_call<T>(
  chainId: number | string,
  args: {
    from?: string;
    to: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: string | number;
    data: string;
  },
  fast = false
) {
  const resp = await eth_call_return(chainId, args, fast);
  return resp?.result as T;
}

export async function eth_call_return(
  chainId: number | string,
  args: {
    from?: string;
    to: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: string | number;
    data: string;
  },
  fast = false
): Promise<{ result?: any; error?: { message: string; code: number; data: any }; id: number } | undefined> {
  let attempts = 0;
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [args, 'latest'],
        id: Date.now(),
      });

      if (resp.error) {
        __DEV__ && console.log('eth_call_return', resp.error, url, args);

        if (fast) {
          return resp;
        }

        if (attempts++ > 3) return resp;

        continue;
      }

      return resp;
    } catch (error) {
      __DEV__ && console.error(error, url);
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export async function rawCall(chainId: number | string, payload: any) {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const resp = await post(url, { jsonrpc: '2.0', id: Date.now(), ...payload });
      return resp.result;
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }
}

export async function callRPC(url: string, payload: { method: string; data?: string }) {
  const resp = await post(url, { jsonrpc: '2.0', id: Date.now(), ...payload });
  return resp.result;
}

/**
 * if the value is not undefined, it must be 0x123xxx, never be 0x0123!!!
 * @param chainId
 * @param args
 * @returns
 */
export async function estimateGas(
  chainId: number,
  args: {
    from: string;
    to?: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: BigNumberish;
    data: string;
  }
) {
  const urls = getRPCUrls(chainId);
  let errorMessage = '';
  let errors = 0;

  for (const url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [args, 'latest'],
        id: Date.now(),
      });

      if (resp.error) {
        __DEV__ && console.log('estimateGas', resp.error);

        errorMessage = resp.error.message || errorMessage;
        if (errors++ >= 3) break; // Speed up error checking

        continue;
      }

      return { gas: Number(resp.result as string) };
    } catch (error) {
      console.log('estimateGas', error);
      markRPCFailed(chainId, url);
    }
  }

  return { errorMessage };
}

export async function getGasPrice(chainId: number) {
  let attempts = 0;
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: Date.now(),
      });

      if (resp.error) {
        if (attempts++ > 3) return;
        continue;
      }

      const wei = Number.parseInt(resp.result);
      const minGwei = MinWei.get(chainId) || 0;

      return Math.max(wei, minGwei);
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export async function getTransactionReceipt(chainId: number, hash: string) {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      const resp = await post(url, { jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [hash], id: Date.now() });

      if (resp.error) continue;

      if (!resp.result) {
        return null;
      }

      return resp.result as {
        transactionHash: string;
        transactionIndex: string;
        blockNumber: string;
        blockHash: string;
        contractAddress: string;
        status: string;
        gasUsed: string;
      };
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export async function getNextBlockBaseFee(chainId: number) {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      return await getNextBlockBaseFeeByRPC(url);
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return 0;
}

export async function getNextBlockBaseFeeByRPC(url: string) {
  const resp = await post(url, {
    jsonrpc: '2.0',
    method: 'eth_feeHistory',
    params: [1, 'latest', []],
    id: Date.now(),
  });

  const { baseFeePerGas } = resp.result as { baseFeePerGas: string[]; oldestBlock: number };

  if (baseFeePerGas.length === 0) return 0;

  return Number.parseInt(baseFeePerGas[baseFeePerGas.length - 1]);
}

export async function getMaxPriorityFee(chainId: number) {
  const urls = getRPCUrls(chainId);

  for (const url of urls) {
    try {
      return await getMaxPriorityFeeByRPC(url);
    } catch (error) {}
  }

  return 0;
}

export async function getMaxPriorityFeeByRPC(url: string) {
  const resp = await post(url, {
    jsonrpc: '2.0',
    method: 'eth_maxPriorityFeePerGas',
    params: [],
    id: Date.now(),
  });

  return Number.parseInt(resp.result || 0);
}

export async function getCode(chainId: number, contract: string): Promise<string | undefined> {
  const urls = getRPCUrls(chainId);
  let attempts = 0;

  for (const url of urls) {
    try {
      const resp = await post(url, { jsonrpc: '2.0', method: 'eth_getCode', params: [contract, 'latest'], id: Date.now() });

      if (resp.error) {
        if (attempts++ > 3) return resp;
        continue;
      }

      return resp.result as string;
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export function getProviderByChainId(chainId: number) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      return new StaticJsonRpcProvider(url);
    } catch (error) {}
  }
}

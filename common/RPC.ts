import { BigNumber, utils } from 'ethers';

import Networks from '../viewmodels/Networks';
import Providers from '../configs/providers.json';
import { post } from '../utils/fetch';

const cache = new Map<number, string[]>();
const failedRPCs = new Map<number, Set<string>>();

export function getRPCUrls(chainId: number | string): string[] {
  if (cache.has(Number(chainId))) return cache.get(Number(chainId)) || [];

  let urls: string[] = Providers[`${Number(chainId)}`]?.filter((p) => p.startsWith('http')) ?? [];
  let availableUrls: string[];

  const network = Networks.find(chainId);
  const failed = failedRPCs.get(Number(chainId));

  urls.unshift(...(network?.rpcUrls ?? []));

  availableUrls = urls.filter((url) => !(failed?.has(url) ?? false));
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

  for (let url of urls) {
    try {
      const result = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: Date.now(),
      });

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

  for (let url of urls) {
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

      if (utils.isBytesLike(resp.result)) {
      }

      if (chainId !== 1 || !urls.find((url) => url.includes('rpc.flashbots.net'))) {
        urls.slice(urls.indexOf(url)).map((rpcUrl) => eth_sendRawTransaction(rpcUrl).catch(() => {}));
      }

      return resp;
    } catch {}
  }

  return { error, id: 0, result: undefined };
}

export async function getTransactionCount(chainId: number, address: string) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'pending'],
        id: Date.now(),
      });

      const { result } = resp as { id: number; result: string };
      return Number.parseInt(result);
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
  }
) {
  const resp = await eth_call_return(chainId, args);
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
  }
) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [args, 'latest'],
        id: Date.now(),
      });

      return resp;
    } catch (error) {
      console.log(error);
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export async function rawCall(chainId: number | string, payload: any) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
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

export async function estimateGas(
  chainId: number,
  args: {
    from: string;
    to: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: string | number;
    data: string;
  }
) {
  const urls = getRPCUrls(chainId);
  let errorMessage = '';
  let errors = 0;

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [args],
        id: Date.now(),
      });

      if (resp.error) {
        errorMessage = resp.error.message;
        if (errors++ > 3) break; // Speed up error checking

        continue;
      }

      return { gas: Number(resp.result as string) };
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return { errorMessage };
}

export async function getGasPrice(chainId: number) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: Date.now(),
      });

      if (resp.error) continue;

      return Number.parseInt(resp.result);
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

export async function getTransactionReceipt(chainId: number, hash: string) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, { jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [hash], id: Date.now() });

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

  for (let url of urls) {
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

  for (let url of urls) {
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

export async function getCode(chainId: number, contract: string) {
  const urls = getRPCUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, { jsonrpc: '2.0', method: 'eth_getCode', params: [contract, 'latest'], id: Date.now() });

      if (resp.error) continue;

      return resp.result as string;
    } catch (error) {
      markRPCFailed(chainId, url);
    }
  }

  return undefined;
}

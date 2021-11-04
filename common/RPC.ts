import { BigNumber } from 'ethers';
import Providers from '../configs/providers.json';
import { post } from '../utils/fetch';

function getUrls(chainId: number): string[] {
  return Providers[`${chainId}`].filter((p) => p.startsWith('http'));
}

export async function getBalance(chainId: number, address: string): Promise<BigNumber> {
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const result = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: Date.now(),
      });

      return BigNumber.from(result.result);
    } catch (error) {}
  }

  return BigNumber.from(0);
}

export async function sendTransaction(chainId: number, txHex: string) {
  const urls = getUrls(chainId);

  try {
    const result = await Promise.any(
      urls.map(async (url) => {
        const resp = await post(url, {
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [txHex],
          id: Date.now(),
        });

        if (resp.error) {
          throw new Error(resp.error.message);
        }

        return resp as { id: number; result: string; error: { code: number; message: string } };
      })
    );

    return result;
  } catch (error) {
    return { error: (error as AggregateError).errors[0], result: undefined };
  }
}

export async function getTransactionCount(chainId: number, address: string) {
  const urls = getUrls(chainId);

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
    } catch (error) {}
  }

  return 0;
}

export async function call<T>(
  chainId: number,
  args: {
    from?: string;
    to: string;
    gas?: string | number;
    gasPrice?: string | number;
    value?: string | number;
    data: string;
  }
) {
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [args, 'latest'],
        id: Date.now(),
      });

      return resp.result as T;
    } catch (error) {}
  }

  return undefined;
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
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [args, 'latest'],
        id: Date.now(),
      });

      return resp.result as string;
    } catch (error) {}
  }

  return undefined;
}

export async function getGasPrice(chainId: number) {
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: Date.now(),
      });

      return Number.parseInt(resp.result);
    } catch (error) {}
  }

  return undefined;
}

export async function getTransactionReceipt(chainId: number, hash: string) {
  const urls = getUrls(chainId);

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
    } catch (error) {}
  }

  return undefined;
}

export async function getNextBlockBaseFee(chainId: number) {
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_feeHistory',
        params: [1, 'latest', []],
        id: Date.now(),
      });

      const { baseFeePerGas } = resp.result as { baseFeePerGas: string[]; oldestBlock: number };

      if (baseFeePerGas.length === 0) return 0;

      return Number.parseInt(baseFeePerGas[baseFeePerGas.length - 1]);
    } catch (error) {}
  }

  return 0;
}

export async function getMaxPriorityFee(chainId: number) {
  const urls = getUrls(chainId);

  for (let url of urls) {
    try {
      const resp = await post(url, {
        jsonrpc: '2.0',
        method: 'eth_maxPriorityFeePerGas',
        params: [],
        id: Date.now(),
      });

      return Number.parseInt(resp.result);
    } catch (error) {}
  }

  return 0;
}

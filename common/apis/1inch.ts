import { utils } from 'ethers';

const apiBaseUrl = 'https://api.1inch.io/v5.0';

function apiRequestUrl(chainId: number, methodName: string, queryParams: any = {}) {
  return `${apiBaseUrl}/${chainId}/${methodName}?${new URLSearchParams(queryParams).toString()}`;
}

interface InchResponseBase {
  statusCode?: number;
  error?: string;
  description?: string;
}

export interface SwapProtocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

interface QuoteResponse extends InchResponseBase {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: SwapProtocol[];
  estimatedGas: number;
}

export interface SwapResponse extends InchResponseBase {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: SwapProtocol[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  };
}

interface TokensResponse extends InchResponseBase {
  tokens: {
    [address: string]: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI: string;
      tags: string[];
    };
  };
}

interface QuoteRequest {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fee: number;
}

interface SwapRequest extends QuoteRequest {
  fromAddress: string;
  slippage: number;
  referrerAddress?: string;
}

export const Methods = {
  healthcheck: { name: 'healthcheck' },
  tokens: { name: 'tokens' },
  quote: { name: 'quote', request: (params: QuoteRequest) => params },
  swap: { name: 'swap', request: (params: SwapRequest) => params },
};

export async function healthcheck(chainId: number) {
  try {
    const resp = await fetch(apiRequestUrl(chainId, Methods.healthcheck.name));
    return ((await resp.json()) as { status: 'OK' }).status === 'OK';
  } catch (error) {}

  return false;
}

export async function fetchTokens(chainId: number) {
  try {
    const resp = await fetch(apiRequestUrl(chainId, Methods.tokens.name));
    const { tokens } = (await resp.json()) as TokensResponse;

    return Object.getOwnPropertyNames(tokens)
      .filter((t) => t.length === 42 && t !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
      .map((addr) => {
        const t: any = tokens[addr];
        delete t.tags;
        return tokens[addr];
      });
  } catch (error) {}

  return [];
}

export async function quote(chainId: number, params: QuoteRequest) {
  try {
    const resp = await fetch(apiRequestUrl(chainId, Methods.quote.name, params));
    return (await resp.json()) as QuoteResponse;
  } catch (error) {}
}

export async function swap(chainId: number, params: SwapRequest) {
  try {
    const resp = await fetch(apiRequestUrl(chainId, Methods.swap.name, params));
    return (await resp.json()) as SwapResponse;
  } catch (error) {}
}

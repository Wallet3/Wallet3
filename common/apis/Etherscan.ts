import { etherscanApiKeys } from '../../configs/secret';

export async function getAbi(contract: string, chainId: number, apiUrl: string) {
  const keys = etherscanApiKeys[chainId] || [];
  const key = keys[Date.now() % keys.length] || '';

  try {
    const resp = await fetch(`${apiUrl}?module=contract&action=getabi&address=${contract}&apikey=${key}`);
    const { result } = (await resp.json()) as { result: string };
    return JSON.parse(result) as any[];
  } catch (error) {}
}

import { AddressMetadataAPI } from './Etherscan.types';
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

export async function getAddressMetadata(addresses: string[], chainId: number, apiUrl: string) {
  const keys = etherscanApiKeys[chainId] || [];
  const key = keys[Date.now() % keys.length] || '';
  const addr = addresses.length === 1 ? addresses[0] : addresses.join(',');

  try {
    const resp = await fetch(`${apiUrl}?module=nametag&action=getaddresstag&apikey=${key}&address=${addr}`);
    const data = (await resp.json()) as AddressMetadataAPI;

    const { status, result } = data;
    if (Number(status) === 0) return;

    return result;
  } catch (error) {}
}

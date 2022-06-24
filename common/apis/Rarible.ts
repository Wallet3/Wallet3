import { Nft, NftsByOwner } from './Rarible.types';

import { NftsByOwnerV2 } from './Rarible.v2.types';

export async function getNftsByOwner(
  owner: string,
  options: { size?: number; continuation?: string; chain?: string | 'ethereum' | 'polygon' } = {
    size: 100,
    continuation: '',
    chain: 'ethereum',
  }
) {
  const { size, continuation, chain } = options;

  const uri = `https://${chain}-api.rarible.org/v0.1/nft/items/byOwner?owner=${owner.toLowerCase()}&size=${
    size ?? 50
  }&continuation=${continuation}`;

  try {
    const resp = await fetch(uri);
    return (await resp.json()) as NftsByOwner;
  } catch (error) {}
}

export async function getNftById(contract: string, tokenId: string, chain: 'ethereum' | 'polygon') {
  const uri = `https://${chain}-api.rarible.org/v0.1/nft/items/${contract}:${tokenId}`;

  try {
    const resp = await fetch(uri);
    return (await resp.json()) as Nft;
  } catch {}
}

export async function getNftsByOwnerV2(owner: string) {
  const uri = `https://api.rarible.org/v0.1/items/byOwner?owner=ETHEREUM:${owner}`;

  try {
    const resp = await fetch(uri);
    return (await resp.json()) as NftsByOwnerV2;
  } catch {}
}

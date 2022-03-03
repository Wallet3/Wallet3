import { NftsByOwner } from './Rarible.types';

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

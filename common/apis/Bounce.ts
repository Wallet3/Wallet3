import { BounceResponse } from './Bounce.types';

export async function getBounceNfts(owner: string, chain: 'main' | 'bsc' = 'bsc') {
  try {
    const resp = await fetch(`https://nftview.bounce.finance/v2/${chain}/nft?user_address=${owner}`);
    return (await resp.json()) as BounceResponse;
  } catch (error) {}
}

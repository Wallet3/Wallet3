import { BounceResponse } from './Bounce.types';

export async function getBscNfts(owner: string) {
  try {
    const resp = await fetch(`https://nftview.bounce.finance/v2/bsc/nft?user_address=${owner}`);
    return (await resp.json()) as BounceResponse;
  } catch (error) {}
}

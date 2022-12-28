import { Asset, OpenseaAssetsResponse, OpenseaCollection } from './Opensea.types';

import { OpenseaApiKey } from '../../configs/secret';
import axios from 'axios';

export async function getOpenseaNfts(owner: string, asset_contract_addresses: string[] = []) {
  try {
    // const contractAddrs = asset_contract_addresses.reduce((prev, cur) => `${prev}${cur}`);
    const resp = await axios(`https://api.opensea.io/api/v1/assets?owner=${owner}&include_orders=false`, {
      headers: { 'X-API-KEY': OpenseaApiKey },
    });

    return resp.data as OpenseaAssetsResponse;
  } catch (error) {}
}

export async function getOpenseaCollections(owner: string) {
  try {
    const resp = await axios(`https://api.opensea.io/api/v1/collections?asset_owner=${owner}&limit=300`, {
      headers: { 'X-API-KEY': OpenseaApiKey },
    });

    return (resp.data as OpenseaCollection[]).map((item) => ({
      details: item.description,
      slug: item.slug,
      name: item.name,
      contractAddress: item.primary_asset_contracts[0].address,
      owned: [] as Asset[],
    }));
  } catch (error) {}
}

// export async function getOpensea(owner: string) {
//   const collections = await getOpenseaCollections(owner);
//   if (!collections || collections.length === 0) return [];

//   for (let c of collections) {
//     const assetsResponse = await getOpenseaNfts(owner, c.contractAddress);
//     if (!assetsResponse) continue;

//     c.owned = assetsResponse.assets.filter((item) => item.name && item.image_url);
//   }

//   return collections;
// }

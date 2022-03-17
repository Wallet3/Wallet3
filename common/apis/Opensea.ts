import { OpenseaApiKey } from '../../configs/secret';
import { OpenseaAssetsResponse } from './Opensea.types';
import axios from 'axios';

export async function getOpenseaNfts(owner: string) {
  try {
    const resp = await axios(`https://api.opensea.io/api/v1/assets?owner=${owner}&limit=50`, {
      headers: { 'X-API-KEY': OpenseaApiKey },
    });

    return resp.data as OpenseaAssetsResponse;
  } catch (error) {}
}

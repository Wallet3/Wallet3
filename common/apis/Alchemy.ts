import { AlchemyApiKeys, CenterNFTApis } from '../../configs/secret';

import { AlchemyNFTs } from './Alchemy.types.nfts';
import { AssetChangeResult } from './Alchemy.types.simulate';
import { post } from '../../utils/fetch';

const Chains = {
  1: 'https://eth-mainnet.g.alchemy.com',
  137: 'https://polygon-mainnet.g.alchemy.com',
  10: 'https://opt-mainnet.g.alchemy.com',
  42161: 'https://arb-mainnet.g.alchemy.com',
};

export async function getAlchemyNFTs(owner: string, chainId: number) {
  const keys = AlchemyApiKeys[chainId] as string[];
  const key = keys[Date.now() % keys.length];

  try {
    const resp = await fetch(
      `${Chains[chainId]}/nft/v2/${key}/getNFTs?owner=${owner}&withMetadata=true&orderBy=transferTime&excludeFilters\[\]=SPAM`
    );
    return (await resp.json()) as AlchemyNFTs;
  } catch (error) {}
}

const CenterNetworks = {
  43114: 'avalanche-mainnet',
  42220: 'celo-mainnet',
  250: 'fantom-mainnet',
  1666600000: 'harmony-mainnet',
};

export async function getCenterNFTs(owner: string, chainId: number) {
  if (!CenterNetworks[chainId]) return;

  const api = CenterNFTApis[Date.now() % CenterNFTApis.length];
  const url = `https://api.center.dev/experimental/alchemy/${CenterNetworks[chainId]}/nft/v2/${api}/getNFTs?owner=${owner}&withMetadata=true&tokenUriTimeoutInMs=0`;

  try {
    const resp = await fetch(url);
    return (await resp.json()) as AlchemyNFTs;
  } catch (error) {}
}

export async function simulateAssetChanges(
  chainId: number,
  params: { from: string; to: string; value: string; data: string }[]
) {
  const endpoint = Chains[chainId];
  const keys = AlchemyApiKeys[chainId];
  const key = keys[Date.now() % keys.length];

  if (!endpoint || !key) return;

  try {
    return (await post(`${endpoint}v2/${key}`, {
      id: Date.now(),
      jsonrpc: '2.0',
      method: 'alchemy_simulateAssetChanges',
      params,
    })) as { error?: { message: string; code: string }; result?: AssetChangeResult };
  } catch (error) {}
}

import { AlchemyApiKeys } from '../../configs/secret';
import { AlchemyNFTs } from './Alchemy.types.nfts';

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

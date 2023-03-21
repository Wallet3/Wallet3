import { BytesLike, Wallet, providers } from 'ethers';

import { ERC4337Client } from './ERC4337Client';
import Networks from '../core/Networks';
import { getRPCUrls } from '../../common/RPC';
import { getSecureRandomBytes } from '../../utils/math';

const ERC4337Clients = new Map<string, ERC4337Client>();

export async function createERC4337Client(chainId: number, owner = new Wallet(getSecureRandomBytes(32))) {
  const key = `${chainId}:${owner.address}`;

  const cache = ERC4337Clients.get(key);
  if (cache) return cache;

  const network = Networks.find(chainId);
  if (!network?.erc4337) return;

  const { entryPointAddress, factoryAddress } = network.erc4337;
  const rpcUrls = getRPCUrls(chainId);

  let provider!: providers.JsonRpcProvider;

  for (let url of rpcUrls) {
    provider = new providers.JsonRpcProvider(url);

    try {
      if ((await provider.getBlockNumber()) > 0) break;
    } catch (error) {}
  }

  const client = new ERC4337Client({
    provider,
    owner,
    entryPointAddress,
    factoryAddress,
  });

  ERC4337Clients.set(key, client);
  return client;
}

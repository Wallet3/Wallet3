import { BytesLike, Wallet, providers } from 'ethers';

import Networks from '../core/Networks';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { getRPCUrls } from '../../common/RPC';
import { getSecureRandomBytes } from '../../utils/math';

const ERC4337Clients = new Map<number, SimpleAccountAPI>();

export async function createERC4337Client(chainId: number, owner = new Wallet(getSecureRandomBytes(32))) {
  const cache = ERC4337Clients.get(chainId);
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

  const client = new SimpleAccountAPI({
    provider,
    owner,
    entryPointAddress,
    factoryAddress,
  });

  ERC4337Clients.set(chainId, client);
  return client;
}

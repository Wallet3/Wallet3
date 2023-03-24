import { BytesLike, Wallet, providers } from 'ethers';

import { ERC4337Client } from './ERC4337Client';
import { INetwork } from '../../common/Networks';
import Networks from '../core/Networks';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { getRPCUrls } from '../../common/RPC';
import { getSecureRandomBytes } from '../../utils/math';

const ERC4337Clients = new Map<string, ERC4337Client>();

let owner!: Wallet;
const createDefaultOwner = () => owner ?? (owner = new Wallet(getSecureRandomBytes(32)));

export async function createERC4337Client(network: INetwork, owner = createDefaultOwner(), paymaster?: PaymasterAPI) {
  const { chainId, erc4337 } = network;
  const key = `${chainId}:${owner.address}`;

  const cache = ERC4337Clients.get(key);

  if (cache) {
    cache.paymasterAPI = paymaster;
    return cache;
  }

  if (!erc4337) return;

  const { entryPointAddress, factoryAddress } = erc4337;
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
    paymasterAPI: paymaster,
  });

  ERC4337Clients.set(key, client);
  return client;
}

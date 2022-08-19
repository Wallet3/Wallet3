import Networks from '../Networks';
import { providers } from 'ethers/lib/ethers';

let _ensProvider: providers.WebSocketProvider | undefined;

export async function resolveENS(ens: string) {
  _ensProvider = Networks.MainnetWsProvider;

  try {
    const address = (await _ensProvider.resolveName(ens)) || '';

    if (!_ensProvider) return '';
    _ensProvider?.destroy();

    return address;
  } catch (error) {}

  return '';
}

export function clearPendingENSRequests() {
  _ensProvider?.destroy();
  _ensProvider = undefined;
}

export function isENSDomains(ens: string) {
  return ens.endsWith('.eth') || ens.endsWith('.xyz');
}

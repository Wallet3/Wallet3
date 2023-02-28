import { isENSDomain, resolveENS } from './ENSResolver';
import { isKey3DidDomain, resolveKey3Did } from '../../common/apis/Key3did';
import { isUnstoppableDomain, resolveUnstoppableDomain, reverseLookup } from './UnstoppableDomains';

import Networks from '../core/Networks';

export async function resolveDomain(domain: string, chainId: number) {
  if (isENSDomain(domain)) {
    return await resolveENS(domain);
  } else if (isUnstoppableDomain(domain)) {
    return await resolveUnstoppableDomain(domain);
  } else if (isKey3DidDomain(domain)) {
    return await resolveKey3Did(domain, chainId);
  }

  return '';
}

export function isDomain(domain: string) {
  return isENSDomain(domain) || isUnstoppableDomain(domain) || isKey3DidDomain(domain);
}

export async function reverseLookupAddress(address: string) {
  const { MainnetWsProvider } = Networks;

  try {
    return (await MainnetWsProvider.lookupAddress(address)) || (await reverseLookup(address));
  } catch (error) {
  } finally {
    MainnetWsProvider.destroy();
  }
}

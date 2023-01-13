import { isENSDomain, resolveENS } from './ENSResolver';
import { isKey3DidDomain, resolveKey3Did } from '../../common/apis/Key3did';
import { isUnstoppableDomain, resolveUnstoppableDomain } from './UnstoppableDomains';

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

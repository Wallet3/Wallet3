import UnstoppableDomains from '@unstoppabledomains/resolution';
import { utils } from 'ethers';

const suffixes = ['.crypto', '.nft', '.x', '.wallet', '.bitcoin', '.dao', '.888', '.zil', '.blockchain'];
const sdk = new UnstoppableDomains();

export async function resolveDomain(domain: string) {
  try {
    const addr = (await sdk.addr(domain, 'ETH')) || '';
    return utils.isAddress(addr) ? utils.getAddress(addr) : '';
  } catch (error) {
    return '';
  }
}

export function isUnstoppableDomains(domain: string) {
  const lower = domain.toLowerCase();
  return suffixes.some((item) => lower.endsWith(item));
}

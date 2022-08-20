import { getRecords } from '../../common/apis/UnstoppableDomains';

const unDomains = ['.crypto', '.nft', '.x', '.wallet', '.bitcoin', '.dao', '.888', '.zil', '.blockchain'];

export async function resolveDomain(domain: string) {
  const records = await getRecords(domain);
  return records?.records?.['crypto.ETH.address'] ?? '';
}

export function isUnstoppableDomains(domain: string) {
  const lower = domain.toLowerCase();
  return unDomains.some((item) => lower.endsWith(item));
}

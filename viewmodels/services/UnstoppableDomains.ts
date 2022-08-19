import { getRecords } from '../../common/apis/UnstoppableDomains';

export async function resolveDomain(domain: string) {
  const records = await getRecords(domain);
  return records?.records?.['crypto.ETH.address'] ?? '';
}

export function isUnstoppableDomains(domain: string) {
  return domain.endsWith('.nft') || domain.endsWith('.crypto');
}

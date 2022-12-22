import { getAddress, isAddress } from 'ethers/lib/utils';

import { post } from '../../utils/fetch';

const host = 'https://indexer.key3.id/v1';
const suffixes = [
  '.did',
  '.bayc',
  '.punk',
  '.mayc',
  '.azuki',
  '.moonbird',
  '.clonex',
  '.doodle',
  '.mfer',
  '.sandbox',
  '.decentraland',
  '.mimic',
  '.angrycat',
  '.meebit',
  '.potatoz',
  '.coolcat',
  '.loot',
  '.wow',
];

export async function resolveKey3Did(domain: string) {
  try {
    const resp: Key3Response<AccountRecords> = await post(`${host}/account/records`, { account: domain });
    if (resp.errno) return '';

    const addr = resp.data?.records.find((r) => r.key === 'address.60')?.value || '';
    return isAddress(addr) ? getAddress(addr) : '';
  } catch (error) {}

  return '';
}

export function isKey3DidDomain(domain: string) {
  const lower = domain.toLowerCase();
  return suffixes.find((sf) => lower.endsWith(sf)) ? true : false;
}

interface AccountInfo {
  account: string;
  token_id: string;
  owner: string;
  created_at: number;
  expired_at: number;
  status: number;
}

interface Key3Response<T> {
  errno: number;
  errmsg: string;
  data?: T;
}

interface Record {
  key: string;
  value: string;
  ttl: number;
}

interface AccountRecords {
  account: string;
  records: Record[];
}

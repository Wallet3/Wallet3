import Networks from '../core/Networks';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { sleep } from '../../utils/async';

const cache = new Map<string, { publicName: string; dangerous: boolean }>();

async function getHTML(chainId: number, address: string) {
  const explorer = Networks.find(chainId)?.explorer;
  if (!explorer) return undefined;

  try {
    const resp = await axios.get(`${explorer}/address/${address}`);
    const root = parse(resp.data as string);

    return root;
  } catch (error) {}

  return undefined;
}

export async function fetchInfo(chainId: number, address: string) {
  const key = `${chainId}-${address}`;
  if (cache.has(key)) return cache.get(key)!;

  const root = await getHTML(chainId, address);

  const [publicNameTag] = root?.querySelectorAll("span.u-label--secondary span[data-toggle='tooltip']") || [];
  const publicName = publicNameTag?.innerHTML || '';

  const dangerousLabels = root?.querySelectorAll('.u-label--danger');
  const dangerous = dangerousLabels?.map((t) => t.innerHTML);

  const result = { publicName, dangerous: (dangerous && dangerous.length > 0) || false };
  cache.set(key, result);

  return result;
}

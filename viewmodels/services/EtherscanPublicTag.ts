import Networks from '../core/Networks';
import axios from 'axios';
import { parse } from 'node-html-parser';

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

  const dangerous = root?.querySelectorAll('.u-label--danger') || [];
  const warnings = (root?.querySelectorAll('.u-label--warning') || []).filter((i) => i.innerText.toLowerCase() !== 'out');
  const isDangerous = dangerous.length > 0 || warnings.length > 0;

  const [publicNameTag] = root?.querySelectorAll("span.u-label--secondary span[data-toggle='tooltip']") || [];
  const publicName =
    (publicNameTag?.innerHTML || dangerous[0]?.innerText || warnings[0]?.innerText || '').trim() ||
    (isDangerous ? 'Be careful' : '');

  const result = { publicName, dangerous: isDangerous };
  cache.set(key, result);

  return result;
}

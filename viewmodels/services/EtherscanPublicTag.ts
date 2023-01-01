import AddressTag from '../../models/entities/AddressTag';
import Database from '../../models/Database';
import Networks from '../core/Networks';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { utils } from 'ethers';

const cache = new Map<string, AddressTag>();

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
  if (!utils.isAddress(address)) return;

  address = utils.getAddress(address);
  const key = `${chainId}-${address}`;
  if (cache.has(key)) return cache.get(key)!;

  const item = await Database.cloud_address_tags.findOne({ where: { address, chainId } });

  if (item) {
    cache.set(key, item);
    return item;
  }

  const root = await getHTML(chainId, address);

  if (!root) return;

  const dangerous = root?.querySelectorAll('.u-label--danger').map((e) => e.innerText);
  const warnings = (root?.querySelectorAll('.u-label--warning') || [])
    .filter((i) => i.innerText.toUpperCase() !== 'OUT')
    .map((e) => e.innerText);

  let alert = root?.querySelector('div.alert-warning')?.innerText;
  alert = alert?.startsWith('×') ? alert.substring(1) : alert;

  const isDangerous = dangerous.length > 0 || warnings.length > 0;

  const [publicNameTag] = root?.querySelectorAll("span.u-label--secondary span[data-toggle='tooltip']") || [];
  const publicName =
    (publicNameTag?.innerHTML || dangerous[0] || warnings[0] || '').trim() || (isDangerous ? 'Be careful' : '');

  const tag = new AddressTag();
  tag.address = address;
  tag.chainId = chainId;
  tag.alert = alert;
  tag.publicName = publicName;
  tag.warnings = [...dangerous, ...warnings];
  await tag.save();

  cache.set(key, tag);

  return tag;
}

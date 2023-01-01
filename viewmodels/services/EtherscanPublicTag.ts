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

  const warnings = (root?.querySelectorAll('span.u-label--danger, span.u-label--warning') || [])
    .filter((i) => i.innerText.toUpperCase() !== 'OUT')
    .map((e) => e.innerText);

  let alert = root?.querySelector('div.alert-warning, div.alert-danger')?.innerText;
  alert = alert?.startsWith('×') ? alert.substring(1) : alert;

  let [publicNameTag] = root?.querySelectorAll("span.u-label--secondary span[data-toggle='tooltip']");
  if (!publicNameTag) [publicNameTag] = root?.querySelectorAll("span.u-label--secondary[data-toggle='tooltip']");

  const publicName = (publicNameTag?.innerText || warnings[0] || '').trim();

  const tag = new AddressTag();
  tag.address = address;
  tag.chainId = chainId;
  tag.alert = alert;
  tag.publicName = publicName;
  tag.warnings = warnings;
  tag.lastUpdatedTimestamp = Date.now();
  await tag.save();

  cache.set(key, tag);

  return tag;
}

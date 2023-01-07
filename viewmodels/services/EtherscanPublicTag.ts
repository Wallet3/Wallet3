import AddressTag from '../../models/entities/AddressTag';
import { DAY } from '../../utils/time';
import Database from '../../models/Database';
import Networks from '../core/Networks';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { utils } from 'ethers';

const TagsCache = new Map<string, AddressTag | null>();
const AbandonCache = new Map<string, boolean>();

async function getHTML(chainId: number, param: string, type: 'address' | 'tx') {
  const explorer = Networks.find(chainId)?.explorer;
  if (!explorer) return undefined;

  try {
    const resp = await axios.get(`${explorer}/${type}/${param}`);
    const root = parse(resp.data as string);

    return root;
  } catch (error) {}

  return undefined;
}

export async function fetchAddressInfo(chainId: number, address: string) {
  if (!utils.isAddress(address)) return null;

  address = utils.getAddress(address);
  const key = `${chainId}:${address}`;
  if (TagsCache.has(key)) return TagsCache.get(key)!;

  let item = await Database.cloud_address_tags.findOne({ where: { address: key } });

  if (item && Date.now() < item?.lastUpdatedTimestamp + 90 * DAY) {
    TagsCache.set(key, item);
    return item;
  }

  const root = await getHTML(chainId, address, 'address');
  if (!root) return item;

  const warnings = (root?.querySelectorAll('span.u-label--danger, span.u-label--warning') || [])
    .filter((i) => i.innerText.toUpperCase() !== 'OUT')
    .map((e) => e.innerText);

  let alert = root?.querySelector('div.alert-warning, div.alert-danger')?.innerText;
  alert = alert?.startsWith('×') ? alert.substring(1) : alert;

  let [publicNameTag] = root?.querySelectorAll("span.u-label--secondary span[data-toggle='tooltip']");
  if (!publicNameTag) [publicNameTag] = root?.querySelectorAll("span.u-label--secondary[data-toggle='tooltip']");

  const publicName = (publicNameTag?.innerText || warnings[0])?.trim?.();

  if (item && item.publicName === publicName && !item.dangerous && warnings.length === 0 && !alert) {
    item.lastUpdatedTimestamp = Date.now();
    item.save();
    TagsCache.set(key, item);
    return item;
  }

  if (!publicName) {
    TagsCache.set(key, item);
    return item;
  }

  item = item || new AddressTag();
  item.address = key;
  item.chainId = chainId;
  item.alert = alert;
  item.publicName = publicName;
  item.warnings = warnings;
  item.lastUpdatedTimestamp = Date.now();
  await item.save();

  TagsCache.set(key, item);

  return item;
}

export async function isTransactionAbandoned(chainId: number, tx: string) {
  const key = `${chainId}-${tx}`;
  if (AbandonCache.has(key)) return AbandonCache.get(key);

  const root = await getHTML(chainId, tx, 'tx');

  const abandoned =
    root?.querySelector('p.lead')?.innerText?.toLowerCase?.().includes?.('sorry, we are unable to locate') ?? false;
  const hasTx = root?.querySelector('#spanTxHash');

  if (abandoned) {
    AbandonCache.set(key, true);
    return true;
  }

  if (hasTx) {
    AbandonCache.set(key, false);
    return false;
  }

  return false;
}

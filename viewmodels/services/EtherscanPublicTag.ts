import { HTMLElement, parse } from 'node-html-parser';

import AddressTag from '../../models/entities/AddressTag';
import { DAY } from '../../utils/time';
import Database from '../../models/Database';
import Networks from '../core/Networks';
import axios from 'axios';
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

  if (item && Date.now() < item?.lastUpdatedTimestamp + (__DEV__ ? 1 : (chainId === 1 ? 7 : 90) * DAY)) {
    TagsCache.set(key, item);
    return item;
  }

  const root = await getHTML(chainId, address, 'address');
  if (!root) return item;

  const warnings = (root?.querySelectorAll('span.u-label--danger, span.u-label--warning, .badge.bg-warning, .badge.bg-danger') || [])
    .filter((i) => i.innerText && i.innerText.toUpperCase() !== 'OUT')
    .map((e) => e.innerText);

  let alert = root?.querySelector('div.alert-warning, div.alert-danger, .badge.bg-danger')?.innerText;
  alert = alert?.startsWith('×') ? alert.substring(1) : alert;

  const tagSelectors = [
    "span.u-label--secondary span[data-toggle='tooltip']",
    "span.u-label--secondary[data-toggle='tooltip']",
    'span[rel=tooltipEns] span',
    '.badge .text-truncate span',
    'div.d-flex.flex-wrap.align-items-center a.d-flex span.text-truncate',
  ];

  let publicNameTag!: HTMLElement;

  for (let selector of tagSelectors) {
    publicNameTag = root.querySelector(selector)!;
    if (publicNameTag) break;
  }

  const publicName = (publicNameTag?.innerText || warnings[0])?.trim?.(); //?.replaceAll(, '[?]');

  if (/[\u200B|\u200C|\u200D]/.test(publicName)) {
    warnings.push('zero-width characters');
  }

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
    root?.querySelector('h2.h5')?.innerText?.toLowerCase?.().includes?.('sorry, we are unable to locate') ?? false;

  if (abandoned) {
    AbandonCache.set(key, true);
    return true;
  }

  const pendingTx = root?.querySelector('#spanTxHash');
  if (pendingTx) {
    AbandonCache.set(key, false);
    return false;
  }

  return false;
}

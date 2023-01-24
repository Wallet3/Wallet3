import * as Linking from 'expo-linking';

import { DAY, SECOND } from '../../utils/time';

import Database from '../../models/Database';
import UrlTag from '../../models/entities/UrlTag';
import { isPhishing } from '../../common/apis/GoPlus';

const pendingQueue: [string, (result: boolean) => void][] = [];
const Cache = new Map<string, boolean>();
let busy = false;

async function checkUrl() {
  if (busy) return;

  try {
    busy = true;

    if (pendingQueue.length === 0) return;

    const [url, resolve] = pendingQueue.shift()!;

    const { hostname } = Linking.parse(url?.startsWith('https://') ? url : `https://${url}`);
    if (!hostname) {
      resolve(false);
      return;
    }

    if (Cache.has(hostname)) {
      resolve(Cache.get(hostname!)!);
      return;
    }

    let item = await Database.urls.findOne({ where: { hostname } });
    if (item && Date.now() < item.lastUpdatedTimestamp + 30 * DAY) {
      Cache.set(hostname, item.dangerous);
      resolve(item.dangerous);
      return;
    }

    const phishing = await isPhishing(url);
    if (phishing === undefined) {
      Cache.set(hostname, false);
      resolve(false);
      return;
    }

    Cache.set(hostname, phishing);

    item = new UrlTag();
    item.hostname = hostname;
    item.dangerous = phishing;
    item.lastUpdatedTimestamp = Date.now();
    await item.save();

    resolve(phishing);
  } finally {
    busy = false;
    if (pendingQueue.length > 0) setTimeout(() => checkUrl(), 1 * SECOND);
  }
}

export async function isDangerousUrl(url: string) {
  return new Promise<boolean>((resolve) => {
    pendingQueue.push([url, resolve]);
    checkUrl();
  });
}

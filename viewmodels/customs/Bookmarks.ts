import * as Linking from 'expo-linking';

import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { logAddBookmark, logRemoveBookmark } from '../services/Analytics';

import AsyncStorage from '@react-native-async-storage/async-storage';
import LINQ from 'linq';
import Langs from '../settings/Langs';
import { PageMetadata } from '../../screens/browser/Web3View';
import PopularApps from '../../configs/urls/popular.json';
import RiskyHosts from '../../configs/urls/risky.json';
import SecureHosts from '../../configs/urls/verified.json';
import { isDangerousUrl } from '../services/PhishingShield';
import isURL from 'validator/lib/isURL';

const Priorities = new Map<string, number>([
  ['DeFi', 1],
  ['NFT', 2],
  ['NFTs', 2],
  ['Social', 3],
  ['SocialFi', 3],
  ['Games', 4],
  ['Bridges', 5],
  ['Innovations', 6],
  ['Tools', 7],
  ['Education', 8],
  ['Dev', 9],
  ['Others', 999999],
]);

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
  ad?: boolean;
}

const Keys = {
  bookmarks: 'bookmarks_v2',
  historyUrls: 'history-urls',
  recentSites: 'recent-sites',
};

class Bookmarks {
  private _favUrls!: Map<string, string>; // url => category
  _favs: { title: string; data: Bookmark[] }[] = [];

  history: string[] = [];
  recentSites: PageMetadata[] = [];

  get flatFavs() {
    return this._favs.flatMap((g) => g.data);
  }

  get favs() {
    return [
      {
        title: 'popular-dapps',
        data: PopularApps.filter((a) => (a.langs ? a.langs.includes(Langs.currentLang.value) : true)),
      },
      ...this._favs,
    ];
  }

  static findCategory(url: string) {
    if (url.startsWith('http://')) return 'Others';

    try {
      const hostname = url.startsWith('https://') ? Linking.parse(url).hostname! : url;
      const domains = hostname.split('.');

      let wildHostname = '';
      if (domains.length > 2) {
        wildHostname = `*.${hostname.substring(domains[0].length + 1)}`;
      } else {
        wildHostname = `*.${hostname}`;
      }

      return (
        SiteCategories.find((c) => SecureHosts[c].includes(hostname) || SecureHosts[c].includes(wildHostname)) || 'Others'
      );
    } catch (error) {}

    return 'Others';
  }

  constructor() {
    makeObservable(this, {
      history: observable,
      _favs: observable,
      favs: computed,
      flatFavs: computed,
      remove: action,
      add: action,
      submitHistory: action,
      reset: action,

      recentSites: observable,
      addRecentSite: action,
      removeRecentSite: action,
    });

    AsyncStorage.getItem(Keys.bookmarks)
      .then((v) =>
        runInAction(() => {
          this._favs = JSON.parse(v || '[]');
          this._favUrls = new Map(this._favs.flatMap((g) => g.data.map((item) => [item.url, g.title] as [string, string])));
        })
      )
      .catch(() => {});

    AsyncStorage.getItem(Keys.historyUrls)
      .then((v) => runInAction(() => (this.history = JSON.parse(v || '[]'))))
      .catch(() => {});

    AsyncStorage.getItem(Keys.recentSites)
      .then((v) => runInAction(() => (this.recentSites = JSON.parse(v || '[]'))))
      .catch(() => {});
  }

  add(bookmark: Bookmark) {
    bookmark.title = bookmark.title || Linking.parse(bookmark.url).hostname || bookmark.url;

    const category = Bookmarks.findCategory(bookmark.url);

    const group = this._favs.find((g) => g.title === category);
    if (group) {
      group.data.push(bookmark);
    } else {
      this._favs = LINQ.from([...this._favs, { title: category, data: [bookmark] }])
        .orderBy((i) => Priorities.get(i.title))
        .toArray();
    }

    this._favUrls.set(bookmark.url, category);

    AsyncStorage.setItem(Keys.bookmarks, JSON.stringify(this._favs));
    logAddBookmark();
  }

  remove(url: string) {
    const group = this._favs.find((g) => g.data.find((i) => i.url === url));
    if (!group) return;

    const index = group.data.findIndex((i) => i.url === url);
    group.data.splice(index, 1);

    if (group.data.length === 0) {
      const groupIndex = this._favs.findIndex((g) => g.title === group.title);
      this._favs.splice(groupIndex, 1);
    }

    this._favUrls.delete(url);

    AsyncStorage.setItem(Keys.bookmarks, JSON.stringify(this._favs));
    logRemoveBookmark();
  }

  has(url: string) {
    return this._favUrls.get(url);
  }

  submitHistory(url: string) {
    url = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    this.history = [url, ...this.history.filter((i) => !i.includes(url) || !url.includes(i))];
    AsyncStorage.setItem(Keys.historyUrls, JSON.stringify(this.history.slice(0, 100)));
  }

  addRecentSite(metadata: PageMetadata) {
    const index = this.recentSites.findIndex((s) => s.hostname === metadata.hostname);

    if (index !== -1) {
      const [item] = this.recentSites.splice(index, 1);
      this.recentSites.unshift(item);
      AsyncStorage.setItem('recent-sites', JSON.stringify(this.recentSites));
      return;
    }

    const deniedColors = ['#ffffff', '#000000', 'white', '#fff', '#000', 'black', 'hsl(0, 0%, 100%)', null, undefined];

    metadata.themeColor = deniedColors.includes(metadata.themeColor?.toLowerCase()?.substring(0, 7))
      ? '#999'
      : metadata.themeColor;

    this.recentSites.unshift(metadata);

    if (this.recentSites.length > 18) this.recentSites.pop();

    AsyncStorage.setItem('recent-sites', JSON.stringify(this.recentSites));
  }

  removeRecentSite(site: PageMetadata) {
    const index = this.recentSites.indexOf(site);
    if (index === -1) return;

    this.recentSites.splice(index, 1);
    AsyncStorage.setItem('recent-sites', JSON.stringify(this.recentSites));
  }

  reset() {
    this._favs = [];
    this.history = [];
    this.recentSites = [];
  }
}

export default new Bookmarks();

const SiteCategories = Object.getOwnPropertyNames(SecureHosts);

const SecureUrls: string[] = Object.getOwnPropertyNames(SecureHosts).flatMap((category) => SecureHosts[category]);
export const HttpsSecureUrls = SecureUrls.map((i) => `https://${i.replace('*.', '')}`);

const SecureUrlsSet = new Set(SecureUrls);
const RiskyUrlsSet = new Set(RiskyHosts);
const SecureUrlCache = new Set<string>();

export function isSecureSite(url: string) {
  if (!url.startsWith('https://')) return false;

  if (SecureUrlCache.has(url)) return true;

  try {
    const { hostname } = Linking.parse(url);
    if (!hostname) return false;

    if (SecureUrlsSet.has(hostname)) {
      SecureUrlCache.add(url);
      return true;
    }

    const domains = hostname.split('.');
    if (domains.length > 2 && SecureUrlsSet.has(`*.${hostname.substring(domains[0].length + 1)}`)) {
      SecureUrlCache.add(url);
      return true;
    }

    if (SecureUrlsSet.has(`*.${hostname}`)) {
      SecureUrlCache.add(url);
      return true;
    }
  } catch (error) {}

  return false;
}

export async function isRiskySite(url: string) {
  if (!isURL(url)) return false;

  try {
    return RiskyUrlsSet.has(Linking.parse(url).hostname || '') || (await isDangerousUrl(url));
  } catch (error) {}

  return false;
}

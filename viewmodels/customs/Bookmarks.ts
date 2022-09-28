import * as Linking from 'expo-linking';

import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import LINQ from 'linq';
import { PageMetadata } from '../../screens/browser/Web3View';
import PhishingConfig from 'eth-phishing-detect/src/config.json';
import PopularApps from '../../configs/urls/popular.json';
import RiskyHosts from '../../configs/urls/risky.json';
import SecureHosts from '../../configs/urls/verified.json';

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
}

class Bookmarks {
  _favs: { title: string; data: Bookmark[] }[] = [];

  history: string[] = [];
  recentSites: PageMetadata[] = [];

  get flatFavs() {
    return this._favs.flatMap((g) => g.data);
  }

  get favs() {
    return [{ title: 'popular-dapps', data: PopularApps }, ...this._favs];
  }

  static findCategory(url: string) {
    try {
      const hostname = url.startsWith('https://') ? Linking.parse(url).hostname : url;
      const categories = Object.getOwnPropertyNames(SecureHosts);
      return categories.find((c) => SecureHosts[c].includes(hostname)) || 'Others';
    } catch (error) {}

    return 'Others';
  }

  async upgrade() {
    const v = await AsyncStorage.getItem(`bookmarks`);
    const items = JSON.parse(v || '[]') as Bookmark[];
    if (!v || items.length === 0) return false;

    const groups = LINQ.from(items)
      .groupBy((item) => Bookmarks.findCategory(item.url))
      .orderBy((i) => Priorities.get(i.key()))
      .toArray();

    const favs: { title: string; data: Bookmark[] }[] = [];

    for (let group of groups) {
      favs.push({
        title: group.key(),
        data: group.toArray(),
      });
    }

    await AsyncStorage.removeItem('bookmarks');
    await AsyncStorage.setItem(`bookmarks_v2`, JSON.stringify(favs));

    runInAction(() => {
      this._favs = favs;
    });

    return true;
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

    this.upgrade()
      .then((v) =>
        v
          ? undefined
          : AsyncStorage.getItem(`bookmarks_v2`)
              .then((v) => runInAction(() => (this._favs = JSON.parse(v || '[]'))))
              .catch(() => {})
      )
      .catch(() => {});

    AsyncStorage.getItem(`history-urls`)
      .then((v) => runInAction(() => (this.history = JSON.parse(v || '[]'))))
      .catch(() => {});

    AsyncStorage.getItem('recent-sites')
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

    AsyncStorage.setItem(`bookmarks_v2`, JSON.stringify(this._favs));
  }

  remove(url: string) {
    const group = this.has(url);
    if (!group) return;

    const index = group.data.findIndex((i) => i.url === url);
    group.data.splice(index, 1);

    if (group.data.length === 0) {
      const groupIndex = this._favs.findIndex((g) => g.title === group.title);
      this._favs.splice(groupIndex, 1);
    }

    AsyncStorage.setItem(`bookmarks_v2`, JSON.stringify(this._favs));
  }

  has(url: string) {
    return this._favs.find((g) => g.data.find((i) => i.url === url));
  }

  submitHistory(url: string) {
    url = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    this.history = [url, ...this.history.filter((i) => !i.includes(url) || !url.includes(i))];
    AsyncStorage.setItem(`history-urls`, JSON.stringify(this.history.slice(0, 100)));
  }

  addRecentSite(metadata: PageMetadata) {
    const index = this.recentSites.findIndex((s) => s.hostname === metadata.hostname);

    if (index !== -1) {
      const [item] = this.recentSites.splice(index, 1);
      this.recentSites.unshift(item);
      AsyncStorage.setItem('recent-sites', JSON.stringify(this.recentSites));
      return;
    }

    if (isRiskySite(metadata.origin)) return;

    const deniedColors = ['#ffffff', '#000000', 'white', '#fff', '#000', 'black', 'hsl(0, 0%, 100%)', null, undefined];

    metadata.themeColor = deniedColors.includes(metadata.themeColor?.toLowerCase()?.substring(0, 7))
      ? '#999'
      : metadata.themeColor;

    this.recentSites.unshift(metadata);

    if (this.recentSites.length > 15) this.recentSites.pop();

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
export const SecureUrls = Object.getOwnPropertyNames(SecureHosts).flatMap((category) => SecureHosts[category]);

const SecureSet = new Set(SecureUrls);
const RiskySet = new Set(PhishingConfig.blacklist.concat(RiskyHosts));

export function isSecureSite(url: string) {
  if (!url.startsWith('https://')) return false;

  try {
    return SecureSet.has(Linking.parse(url).hostname || '');
  } catch (error) {}

  return false;
}

export function isRiskySite(url: string) {
  if (!url) return false;

  try {
    return RiskySet.has(Linking.parse(url).hostname || '');
  } catch (error) {}

  return false;
}

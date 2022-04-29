import * as Linking from 'expo-linking';

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageMetadata } from '../../screens/browser/Web3View';
import PhishingConfig from 'eth-phishing-detect/src/config.json';
import RiskyHosts from '../../configs/urls/risky.json';
import SecureHosts from '../../configs/urls/verified.json';

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
}

class Bookmarks {
  favs: Bookmark[] = [];
  history: string[] = [];
  recentSites: PageMetadata[] = [];

  constructor() {
    makeObservable(this, {
      history: observable,
      favs: observable,
      remove: action,
      add: action,
      submitHistory: action,
      reset: action,

      recentSites: observable,
      addRecentSite: action,
      removeRecentSite: action,
    });

    AsyncStorage.getItem(`bookmarks`)
      .then((v) => runInAction(() => (this.favs = JSON.parse(v || '[]'))))
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
    this.favs.push(bookmark);
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.favs));
  }

  remove(url: string) {
    const index = this.favs.findIndex((i) => i.url === url);
    if (index === -1) return;

    this.favs.splice(index, 1);
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.favs));
  }

  has(url: string) {
    return this.favs.find((i) => i.url === url) ? true : false;
  }

  submitHistory(url: string) {
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
    this.favs = [];
    this.history = [];
    this.recentSites = [];
  }
}

export default new Bookmarks();

const SecureSet = new Set(Object.getOwnPropertyNames(SecureHosts).flatMap((category) => SecureHosts[category]));
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

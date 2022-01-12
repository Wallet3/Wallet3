import * as Linking from 'expo-linking';

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import RiskyUrls from '../../configs/urls/risky.json';
import SecureUrls from '../../configs/urls/verified.json';

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
}

class Bookmarks {
  favs: Bookmark[] = [];
  history: string[] = [];
  separatedSites: string[] = [];

  constructor() {
    makeObservable(this, {
      history: observable,
      favs: observable,
      remove: action,
      add: action,
      submitHistory: action,
      reset: action,
      separatedSites: observable,
      addSeparatedSite: action,
      removeSeparatedSite: action,
    });

    AsyncStorage.getItem(`bookmarks`)
      .then((v) => {
        runInAction(() => (this.favs = JSON.parse(v || '[]')));
      })
      .catch(() => {});

    AsyncStorage.getItem(`history-urls`)
      .then((v) => {
        runInAction(() => (this.history = JSON.parse(v || '[]')));
      })
      .catch(() => {});

    AsyncStorage.getItem(`separated-sites`)
      .then((v) => runInAction(() => (this.separatedSites = JSON.parse(v || '[]'))))
      .catch(() => {});
  }

  add(obj: Bookmark) {
    obj.title = obj.title || Linking.parse(obj.url).hostname || obj.url;
    this.favs.push(obj);
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.favs));
  }

  remove(url: string) {
    this.favs = this.favs.filter((i) => !i.url.startsWith(url) && !url.startsWith(i.url));
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.favs));
  }

  has(url: string) {
    return this.favs.find((i) => i.url === url) ? true : false;
  }

  submitHistory(url: string) {
    this.history = [url, ...this.history.filter((i) => !i.includes(url) || !url.includes(i))];
    AsyncStorage.setItem(`history-urls`, JSON.stringify(this.history.slice(0, 32)));
  }

  addSeparatedSite(url: string) {
    const { hostname } = Linking.parse(url || 'https://');
    if (!hostname) return;

    this.separatedSites.push(hostname);
    AsyncStorage.setItem('separated-sites', JSON.stringify(this.separatedSites));
  }

  removeSeparatedSite(url: string) {
    const { hostname } = Linking.parse(url || 'https://');
    if (!hostname) return;

    this.separatedSites = this.separatedSites.filter((i) => i !== hostname);
    AsyncStorage.setItem('separated-sites', JSON.stringify(this.separatedSites));
  }

  isSeparatedSite(url: string) {
    const { hostname } = Linking.parse(url || 'https://');
    if (!hostname) return false;

    return this.separatedSites.includes(hostname);
  }

  reset() {
    this.favs = [];
    this.history = [];
  }
}

export default new Bookmarks();

export function isSecureSite(url: string) {
  return SecureUrls.some((i) => url.startsWith(i));
}

export function isRiskySite(url: string) {
  return RiskyUrls.some((i) => url.startsWith(i));
}

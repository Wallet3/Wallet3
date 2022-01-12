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

  constructor() {
    makeObservable(this, {
      history: observable,
      favs: observable,
      remove: action,
      add: action,
      submitHistory: action,
      reset: action,
    });

    AsyncStorage.getItem(`bookmarks`)
      .then((v) => {
        runInAction(() => this.favs.push(...JSON.parse(v || '[]')));
      })
      .catch(() => {});

    AsyncStorage.getItem(`history-urls`)
      .then((v) => {
        runInAction(() => this.history.push(...JSON.parse(v || '[]')));
      })
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

  isSecureSite(url: string) {
    return SecureUrls.some((i) => url.startsWith(i));
  }

  isRiskySite(url: string) {
    return RiskyUrls.some((i) => url.startsWith(i));
  }

  submitHistory(url: string) {
    this.history = [url, ...this.history.filter((i) => !i.includes(url) || !url.includes(i))];
    AsyncStorage.setItem(`history-urls`, JSON.stringify(this.history.slice(0, 32)));
  }

  reset() {
    this.favs = [];
    this.history = [];
  }
}

export default new Bookmarks();

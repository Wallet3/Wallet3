import * as Linking from 'expo-linking';

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
}

export const PopularDApps = [
  { url: 'https://app.uniswap.org', icon: 'https://app.uniswap.org/favicon.png', title: 'Uniswap' },
  { url: 'https://curve.fi', icon: 'https://curve.fi/apple-touch-icon.png', title: 'Curve' },
  { url: 'https://app.compound.finance', icon: 'https://compound.finance/images/compound-512.png', title: 'Compound' },
  { url: 'https://app.sushi.com', icon: 'https://sushi.com/static/media/logo.dec926df.png', title: 'Sushiswap' },
  {
    url: 'https://opensea.io',
    icon: 'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png',
    title: 'Opensea',
  },
  { url: 'https://foundation.app', icon: 'https://foundation.app/apple-touch-icon.png', title: 'Foundation' },
];

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
    return this.favs.find((i) => i.url.startsWith(url) || url.startsWith(i.url)) ? true : false;
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

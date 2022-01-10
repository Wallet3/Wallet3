import * as Linking from 'expo-linking';

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import RiskyUrls from '../../configs/riskyurls.json';
import SecureUrls from '../../configs/urls.json';

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
}

export const PopularDApps = [
  { url: 'https://app.uniswap.org', icon: 'https://app.uniswap.org/favicon.png', title: 'Uniswap' },
  { url: 'https://curve.fi', icon: 'https://curve.fi/apple-touch-icon.png', title: 'Curve' },
  { url: 'https://app.compound.finance', icon: 'https://compound.finance/images/compound-512.png', title: 'Compound' },
  { url: 'https://trade.dydx.exchange', icon: 'https://dydx.exchange/meta/apple-icon-180x180.png', title: 'dYdX' },
  {
    url: 'https://oasis.app',
    icon: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2Fdocs.makerdao.com%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-28427.appspot.com%2Fo%2Fspaces%252F-LtJ1VeNJVW-jiKH0xoL%252Favatar.png%3Fgeneration%3D1574804307039477%26alt%3Dmedia',
    title: 'MakerDAO',
  },
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

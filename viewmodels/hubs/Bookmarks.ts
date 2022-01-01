import * as Linking from 'expo-linking';

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  url: string;
  icon: string;
  title: string;
}

class Bookmarks {
  items: Bookmark[] = [];
  history: string[] = [];

  constructor() {
    makeObservable(this, { history: observable, items: observable, remove: action, add: action, submitHistory: action });

    AsyncStorage.getItem(`bookmarks`)
      .then((v) => {
        runInAction(() => this.items.push(...JSON.parse(v || '[]')));
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
    this.items.push(obj);
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.items));
  }

  remove(url: string) {
    this.items = this.items.filter((i) => !i.url.startsWith(url) && !url.startsWith(i.url));
    AsyncStorage.setItem(`bookmarks`, JSON.stringify(this.items));
  }

  has(url: string) {
    return this.items.find((i) => i.url.startsWith(url) || url.startsWith(i.url)) ? true : false;
  }

  submitHistory(url: string) {
    this.history = [url, ...this.history.filter((i) => !i.includes(url) || !url.includes(i))];
    AsyncStorage.setItem(`history-urls`, JSON.stringify(this.history.slice(0, 32)));
  }
}

export default new Bookmarks();

export const SuggestUrls = [
  'https://app.uniswap.org',
  'https://curve.fi',
  'https://oasis.app',
  'https://makerdao.com',
  'https://app.sushi.com',
  'http://app.compound.finance',
  'https://app.aave.com',
  'https://app.balancer.fi',
  'https://yearn.finance',
  'https://trade.dydx.exchange',
  'https://app.dodoex.io',
  'https://app.hashflow.com',
  'https://axieinfinity.com',
  'https://tornadocash.eth.link'
];

export const getFaviconJs = `function getIcons() {
    var links = document.getElementsByTagName('link');
    var icons = [];

    for(var i = 0; i < links.length; i++) {
        var link = links[i];

        //Technically it could be null / undefined if someone didn't set it!
        //People do weird things when building pages!
        var rel = link.getAttribute('rel');
        if(rel) {
            //I don't know why people don't use indexOf more often
            //It is faster than regex for simple stuff like this
            //Lowercase comparison for safety
            if(rel.toLowerCase().indexOf('icon') > -1) {
                var href = link.getAttribute('href');

                //Make sure href is not null / undefined            
                if(href) {
                    //Relative
                    //Lowercase comparison in case some idiot decides to put the 
                    //https or http in caps
                    //Also check for absolute url with no protocol
                    if(href.toLowerCase().indexOf('https:') == -1 && href.toLowerCase().indexOf('http:') == -1
                        && href.indexOf('//') != 0) {

                        //This is of course assuming the script is executing in the browser
                        //Node.js is a different story! As I would be using cheerio.js for parsing the html instead of document.
                        //Also you would use the response.headers object for Node.js below.

                        var absoluteHref = window.location.protocol + '//' + window.location.host;

                        if(window.location.port) {
                            absoluteHref += ':' + window.location.port;
                        }

                        //We already have a forward slash
                        //On the front of the href
                        if(href.indexOf('/') == 0) {
                            absoluteHref += href;
                        }
                        //We don't have a forward slash
                        //It is really relative!
                        else {
                            var path = window.location.pathname.split('/');
                            path.pop();
                            var finalPath = path.join('/');

                            absoluteHref += finalPath + '/' + href;
                        }

                        icons.push(absoluteHref);
                    }
                    //Absolute url with no protocol
                    else if(href.indexOf('//') == 0) {
                        var absoluteUrl = window.location.protocol + href;

                        icons.push(absoluteUrl);
                    }
                    //Absolute
                    else {
                        icons.push(href);
                    }
                }
            }
        }
    }

    return icons.sort((a1, a2) => a2.length - a1.length).filter(i => i.startsWith('http') && !i.endsWith('.svg'))[0] || '';
}

window.ReactNativeWebView.postMessage(JSON.stringify({icon: getIcons(), title: document.title}));`;

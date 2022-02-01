import { getAvatar, getText } from '../../common/ENS';
import { makeObservable, observable, runInAction } from 'mobx';

import Networks from '../Networks';

export class ENSViewer {
  readonly owner: string;

  name = '';
  avatar = '';
  email = '';
  description = '';
  location = '';
  twitter = '';
  github = '';
  coins: { [index: string]: string } = {};

  constructor(owner: string) {
    this.owner = owner;
    makeObservable(this, { name: observable, avatar: observable });
    this.fetchBasicInfo();
  }

  async fetchBasicInfo() {
    if (this.name) return;
    const { MainnetWsProvider } = Networks;

    const ens = await MainnetWsProvider.lookupAddress(this.owner);
    if (!ens) return;

    runInAction(() => (this.name = ens));

    getAvatar(ens, this.owner).then((v) => {
      runInAction(() => (this.avatar = v?.url || ''));
    });
  }

  async fetchMoreInfo() {
    const { MainnetWsProvider } = Networks;
    if (!this.name) return;

    const ens = this.name;

    const resolver = await MainnetWsProvider.getResolver(ens);
    const [btc, ltc, doge, bch, atom] = await Promise.all([
      resolver?.getAddress(0),
      resolver?.getAddress(2),
      resolver?.getAddress(3),
      resolver?.getAddress(145),
      resolver?.getAddress(118),
    ]);

    this.coins['BTC'] = btc || '';
    this.coins['LTC'] = ltc || '';
    this.coins['DOGE'] = doge || '';
    this.coins['BCH'] = bch || '';
    this.coins['ATOM'] = atom || '';

    const [email, desc, location, twitter, github] = await Promise.all([
      getText(ens, 'email'),
      getText(ens, 'description'),
      getText(ens, 'location'),
      getText(ens, 'com.twitter'),
      getText(ens, 'com.github'),
    ]);

    this.email = email;
    this.description = desc;
    this.location = location;
    this.twitter = twitter;
    this.github = github;
  }
}

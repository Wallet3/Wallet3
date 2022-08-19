import { getEnsAvatar, getText } from '../../common/ENS';
import { makeAutoObservable, runInAction } from 'mobx';

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
  loading = false;

  constructor(owner: string) {
    this.owner = owner;
    makeAutoObservable(this);

    this.fetchBasicInfo();
  }

  async fetchBasicInfo() {
    if (this.name) return;
    const { MainnetWsProvider } = Networks;

    const ens = await MainnetWsProvider.lookupAddress(this.owner);
    if (!ens) return;

    // console.log(await Promise.all([MainnetWsProvider.getAvatar(this.owner), MainnetWsProvider.getAvatar(ens)]));

    runInAction(() => (this.name = ens));

    getEnsAvatar(ens, this.owner).then((v) => {
      runInAction(() => (this.avatar = v?.url || ''));
    });
  }

  async fetchMoreInfo() {
    const { MainnetWsProvider } = Networks;
    if (!this.name) return;

    const ens = this.name;
    this.loading = true;

    const resolver = await MainnetWsProvider.getResolver(ens);
    const [btc, ltc, doge, bch, atom] = await Promise.all([
      resolver?.getAddress(0),
      resolver?.getAddress(2),
      resolver?.getAddress(3),
      resolver?.getAddress(145),
      resolver?.getAddress(118),
    ]);

    const [email, desc, location, twitter, github] = await Promise.all([
      getText(ens, 'email'),
      getText(ens, 'description'),
      getText(ens, 'location'),
      getText(ens, 'com.twitter'),
      getText(ens, 'com.github'),
    ]);

    runInAction(() => {
      this.coins['BTC'] = btc || '';
      this.coins['LTC'] = ltc || '';
      this.coins['DOGE'] = doge || '';
      this.coins['BCH'] = bch || '';
      this.coins['ATOM'] = atom || '';

      this.email = email;
      this.description = desc;
      this.location = location;
      this.twitter = twitter;
      this.github = github;
      this.loading = false;
    });
  }
}

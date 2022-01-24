import { POAP, POAPBadge } from '../services/POAP';
import { makeObservable, observable, runInAction } from 'mobx';

import Networks from '../Networks';

class AccountPOAP {
  readonly owner: string;
  badges: POAPBadge[] = [];

  constructor(owner: string) {
    this.owner = owner;

    makeObservable(this, { badges: observable });
    this.fetchBadges();
  }

  async fetchBadges() {
    const provider = Networks.MainnetWsProvider;
    const poap = new POAP(provider);
    const badges = await poap.getNFTs(this.owner);
    runInAction(() => (this.badges = badges));
  }
}

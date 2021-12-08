import { getAvatar, getText } from '../../common/ENS';
import { makeObservable, observable, runInAction } from 'mobx';

import Networks from '../Networks';

export class ENSViewer {
  readonly owner: string;

  name = '';
  avatar = '';

  constructor(owner: string) {
    this.owner = owner;
    makeObservable(this, { name: observable, avatar: observable });
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

    const resolver = await MainnetWsProvider.getResolver(ens);
    console.log(await resolver?.getAddress(0));

    getText(ens, 'email');
  }
}

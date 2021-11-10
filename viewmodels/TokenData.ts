import { makeObservable, observable, runInAction } from 'mobx';

import Coingecko from '../common/apis/Coingecko';

export class TokenData {
  symbol: string = '';
  description: string = '';
  firstDescription = '';

  constructor() {
    makeObservable(this, { symbol: observable, description: observable });
  }

  async setSymbol(symbol: string) {
    this.symbol = symbol;
    this.description = '';

    const result = await Coingecko.getCoinDetails(symbol);
    if (!result) return;

    const { description } = result;
    const [first] = description.en.split(/(?:\r?\n)+/);
    console.log(first);

    runInAction(() => {
      this.firstDescription = first;
      this.description = description.en;
    });
  }
}

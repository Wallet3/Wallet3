import { makeObservable, observable, runInAction } from 'mobx';

import Coingecko from '../common/apis/Coingecko';

interface ITokenData {
  description: string;
  firstDescription: string;
  loading: boolean;
  price: number;
  priceChangeIn24: number;
  priceChangePercentIn24: number;
}

export class TokenData implements ITokenData {
  private cache: { [index: string]: ITokenData } = {};

  symbol: string = '';
  description: string = '';
  firstDescription = '';
  loading = false;
  price = 0;
  priceChangeIn24 = 0;
  priceChangePercentIn24 = 0;

  constructor() {
    makeObservable(this, { symbol: observable, description: observable, firstDescription: observable, loading: observable });
  }

  async setToken(symbol: string, address: string) {
    const data = this.cache[address];

    if (data) {
      runInAction(() => Object.getOwnPropertyNames(data).forEach((key) => (this[key] = data[key])));
      return;
    }

    runInAction(() => {
      this.symbol = symbol;
      this.description = '';
      this.loading = true;
    });

    const result = await Coingecko.getCoinDetails(symbol);
    if (!result) {
      runInAction(() => (this.loading = false));
      return;
    }

    const { description, links, market_data } = result;
    const [first] = description.en.split(/(?:\r?\n)+/);

    runInAction(() => {
      this.firstDescription = first;
      this.description = description.en;
      this.price = market_data.current_price.usd;
      this.priceChangeIn24 = market_data.price_change_24h;
      this.priceChangePercentIn24 = market_data.price_change_percentage_24h;
      this.cache[address] = { ...this };
      this.loading = false;
    });
  }
}

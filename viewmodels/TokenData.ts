import Coingecko, { getMarketChart } from '../common/apis/Coingecko';
import { makeObservable, observable, runInAction } from 'mobx';

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

  historyPrices: number[] = [];
  historyDays = 1;

  constructor() {
    makeObservable(this, {
      symbol: observable,
      description: observable,
      firstDescription: observable,
      loading: observable,
      historyPrices: observable,
      historyDays: observable,
    });
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

    this.refreshHistoryPrices();
    const result = await Coingecko.getCoinDetails(symbol);
    if (!result) {
      runInAction(() => (this.loading = false));
      return;
    }

    const { description, links, market_data } = result;
    const en = description.en.replace(/<[^>]*>?/gm, '');
    const [first] = en.split(/(?:\r?\n)+/);

    runInAction(() => {
      this.firstDescription = first;
      this.description = en;
      this.price = market_data.current_price.usd;
      this.priceChangeIn24 = market_data.price_change_24h;
      this.priceChangePercentIn24 = market_data.price_change_percentage_24h;
      this.cache[address] = { ...this };
      this.loading = false;
    });
  }

  async refreshHistoryPrices() {
    const id = Coingecko.getCoinId(this.symbol);
    const data = await getMarketChart(id, this.historyDays);
    if (!data) {
      return;
    }

    const { prices } = data;
    runInAction(() => (this.historyPrices = prices.map((item) => item[1])));
  }
}

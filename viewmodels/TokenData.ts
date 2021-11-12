import Coingecko, { getMarketChart } from '../common/apis/Coingecko';
import { makeObservable, observable, runInAction } from 'mobx';

import { IToken } from '../common/Tokens';

interface ITokenData {
  description: string;
  firstDescription: string;
  loading: boolean;
  price: number;
  priceChangeIn24: number;
  priceChangePercentIn24: number;
}

export class TokenData implements ITokenData {
  readonly address: string;
  readonly symbol: string;
  description: string = '';
  firstDescription = '';
  loading = false;
  price = 0;
  priceChangeIn24 = 0;
  priceChangePercentIn24 = 0;

  historyPrices: number[] = [];
  historyDays = 1;

  constructor({ token }: { token: IToken }) {
    this.symbol = token.symbol;
    this.address = token.address;

    makeObservable(this, {
      symbol: observable,
      description: observable,
      firstDescription: observable,
      loading: observable,
      historyPrices: observable,
      historyDays: observable,
    });

    this.init();
  }

  private async init() {
    runInAction(() => {
      this.description = '';
      this.loading = true;
    });

    this.refreshHistoryPrices();
    const result = await Coingecko.getCoinDetails(this.symbol);
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

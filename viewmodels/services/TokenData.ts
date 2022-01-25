import Coingecko, { getMarketChart } from '../../common/apis/Coingecko';
import { makeObservable, observable, runInAction } from 'mobx';

import { IToken } from '../../common/Tokens';

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

  coinId?: string;
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

    const result = await Coingecko.getCoinDetails(this.symbol, this.address);

    if (!result) {
      runInAction(() => (this.loading = false));
      return;
    }

    const { description, links, market_data, error, id } = result;

    if (error || !id || !description || !market_data) return;

    this.coinId = id;

    const en = description.en?.replace(/<[^>]*>?/gm, '');
    const [first] = en?.split(/(?:\r?\n)+/);

    runInAction(() => {
      this.firstDescription = first || '';
      this.description = en || '';
      this.price = market_data.current_price?.usd ?? 0;
      this.priceChangeIn24 = market_data.price_change_24h || 0;
      this.priceChangePercentIn24 = market_data.price_change_percentage_24h || 0;
      this.loading = false;
    });

    this.refreshHistoryPrices();
  }

  async refreshHistoryPrices() {
    if (!this.coinId) return;

    const data = await getMarketChart(this.coinId, this.historyDays);
    if (!data) return;

    const { prices } = data;
    if (!prices) return;

    runInAction(() => (this.historyPrices = prices.map((item) => item[1])));
  }
}

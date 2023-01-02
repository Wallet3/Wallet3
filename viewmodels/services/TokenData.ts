import * as Tokens from '../../common/tokens';

import { computed, makeObservable, observable, runInAction } from 'mobx';

import AddressTag from '../../models/entities/AddressTag';
import Coingecko from '../../common/apis/Coingecko';
import { INetwork } from '../../common/Networks';
import Langs from '../settings/Langs';
import { Links } from '../../common/apis/Coingecko.d';
import { UserToken } from './TokensMan';
import axios from 'axios';
import { fetchAddressInfo } from './EtherscanPublicTag';
import { startSpringLayoutAnimation } from '../../utils/animations';

const BuiltInTokens = new Set(Object.getOwnPropertyNames(Tokens).map((name) => Tokens[name]?.address));

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
  readonly network: INetwork;
  readonly infoUrl: string;

  tag: AddressTag | null = null;
  coinId?: string;
  description: string = '';
  firstDescription = '';
  loading = false;
  price = 0;
  priceChangeIn24 = 0;
  priceChangePercentIn24 = 0;

  historyPrices: number[] = [];
  historyDays = 1;
  links?: Links;

  get verified() {
    return BuiltInTokens.has(this.address) || (this.tag && this.tag?.publicName && !this.tag.dangerous);
  }

  get dangerous() {
    return this.tag?.dangerous ?? false;
  }

  constructor({ token, network }: { token: UserToken; network: INetwork }) {
    this.symbol = token.symbol;
    this.address = token.address;
    this.network = network;

    this.infoUrl = `https://github.com/trustwallet/assets/raw/master/blockchains/${
      (network.github_dir || network.network)?.toLowerCase() ?? 'ethereum'
    }/assets/${token.address}/info.json`;

    makeObservable(this, {
      symbol: observable,
      description: observable,
      firstDescription: observable,
      loading: observable,
      historyPrices: observable,
      historyDays: observable,
      tag: observable,
      verified: computed,
      dangerous: computed,
    });

    this.init();
  }

  private async fetchInfo() {
    if (!this.address) return;

    try {
      return (await axios(this.infoUrl)).data as { description: string; links: { name: string; url: string }[] };
    } catch (error) {}
  }

  private async init() {
    runInAction(() => {
      this.description = '';
      this.loading = true;
    });

    if (this.address) {
      fetchAddressInfo(this.network.chainId, this.address).then((tag) => runInAction(() => (this.tag = tag)));
    } else {
      this.tag = { address: '', chainId: this.network.chainId, publicName: this.network.symbol } as any;
    }

    const [result, info] = await Promise.all([
      Coingecko.getCoinDetails(this.symbol, this.address, this.network.network),
      this.fetchInfo(),
    ]);

    const { description, links, market_data, id } = result || {};

    this.coinId = id || '';

    const desc =
      (info?.description?.length ?? 0) > 5
        ? info?.description
        : (description?.[Langs.currentLang.value] || description?.en)?.replace(/<[^>]*>?/gm, '');

    const [first] = desc?.split(/(?:\r?\n)+/) || [];

    const prices = await this.refreshHistoryPrices();

    runInAction(() => {
      startSpringLayoutAnimation();
      this.firstDescription = first || '';
      this.description = desc || '';
      this.links = links;

      const latestPrice = prices?.[this.historyPrices.length - 1] || market_data?.current_price?.usd || 0;
      const oldestPrice = prices?.[0] || latestPrice;

      this.price = latestPrice;
      this.priceChangeIn24 = latestPrice - oldestPrice;
      this.priceChangePercentIn24 = (latestPrice / oldestPrice - 1) * 100;

      this.loading = false;
    });
  }

  async refreshHistoryPrices() {
    if (!this.coinId) return;

    const data = await Coingecko.getMarketChart(this.coinId, this.historyDays);
    if (!data) return;

    const { prices } = data;
    if (!prices || !Array.isArray(prices)) return;

    return runInAction(() => (this.historyPrices = prices.map((item) => item[1])));
  }
}

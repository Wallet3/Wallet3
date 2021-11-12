import { makeObservable, observable, runInAction } from 'mobx';

import { CoinDetails } from './Coingecko.d';

interface Price {
  usd: number;
}

interface ChainsPrice {
  ethereum: Price;
  'huobi-token': Price;
  fantom: Price;
  'matic-network': Price;
  binancecoin: Price;
  okexchain: Price;
  avax: Price;
}

const host = 'https://api.coingecko.com';

export async function getPrice(
  ids = 'ethereum,matic-network,fantom,okexchain,huobi-token,binancecoin,avalanche-2,celo',
  currencies = 'usd'
) {
  try {
    const resp = await (await fetch(`${host}/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`)).json();
    return resp as ChainsPrice;
  } catch (error) {
    return undefined;
  }
}

async function getCoins() {
  try {
    const resp = await (await fetch(`${host}/api/v3/coins/list`)).json();
    return resp as { id: string; symbol: string }[];
  } catch (error) {}
}

async function getCoin(id: string) {
  try {
    const resp = await (await fetch(`${host}/api/v3/coins/${id}`, { cache: 'force-cache' })).json();
    return resp as CoinDetails;
  } catch (error) {}
}

export async function getMarketChart(id: string, days = 1) {
  try {
    const resp = await (
      await fetch(`${host}/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, { cache: 'force-cache' })
    ).json();
    return resp as { prices: [timestamp: number, price: number][]; market_caps: number[][]; total_volumes: number[][] };
  } catch (error) {}
}

const FixedSymbols = {
  uni: 'uniswap',
};

class Coingecko {
  eth: number = 0;
  matic = 0;
  bnb = 0;
  ftm = 0;
  xdai = 1;
  okt = 0;
  ht = 0;
  avax = 0;
  celo = 0;

  timer?: NodeJS.Timer;

  coinSymbolToId!: { [index: string]: string };

  constructor() {
    makeObservable(this, {
      eth: observable,
      matic: observable,
      bnb: observable,
      ftm: observable,
      xdai: observable,
      okt: observable,
      ht: observable,
      avax: observable,
      celo: observable,
    });
  }

  async init() {
    if (this.coinSymbolToId) return;

    this.coinSymbolToId = {};

    const coins = (await getCoins())!;

    if (!coins) return;

    for (let { symbol, id } of coins) {
      this.coinSymbolToId[symbol] = id;
    }

    Object.getOwnPropertyNames(FixedSymbols).forEach((symbol) => {
      this.coinSymbolToId[symbol] = FixedSymbols[symbol];
    });
  }

  async start(delay: number = 25) {
    const run = () => {
      this.timer = setTimeout(() => this.start(delay), delay * 1000);
    };

    clearTimeout(this.timer as any);

    try {
      const data = await getPrice();

      if (!data) {
        run();
        return;
      }

      const { ethereum } = data;

      runInAction(() => {
        this.eth = ethereum.usd;
        this.matic = data['matic-network'].usd;
        this.ftm = data.fantom.usd;
        this.ht = data['huobi-token'].usd;
        this.okt = data['okexchain'].usd;
        this.bnb = data.binancecoin.usd;
        this.avax = data['avalanche-2'].usd;
        this.celo = data['celo'].usd;
      });
    } catch {}

    run();
  }

  async getCoinDetails(symbol: string) {
    await this.init();
    const id = this.coinSymbolToId[symbol.toLowerCase()];
    return await getCoin(id);
  }

  getCoinId(symbol: string) {
    return this.coinSymbolToId[symbol.toLowerCase()];
  }
}

export default new Coingecko();

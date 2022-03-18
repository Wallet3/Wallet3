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

interface CoinMarket {
  prices: [timestamp: number, price: number][];
  market_caps: number[][];
  total_volumes: number[][];
  error?: string;
}

const host = 'https://api.coingecko.com';

export async function getPrice(
  ids = 'ethereum,matic-network,fantom,okexchain,huobi-token,binancecoin,avalanche-2,celo,crypto-com-chain,harmony,moonriver,moonbeam,wrapped-bitcoin,findora,klay-token,ronin',
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
  cro = 0;
  one = 0;
  movr = 0;
  glmr = 0;
  usdc = 1;
  dai = 1;
  wbtc = 0;
  klay = 0;
  fra = 0;
  ron = 0;

  lastRefreshedTimestamp = 0;

  coinSymbolToIds = new Map<string, string[]>();
  coinDetails = new Map<string, CoinDetails>();
  coinIdToMarkets = new Map<string, { market: CoinMarket; timestamp: number }>();

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
    if (this.coinSymbolToIds.size > 10) return;

    const coins = (await getCoins())!;

    if (!coins) return;

    try {
      for (let { symbol, id } of coins) {
        if (id.includes('-wormhole')) continue;
        let ids = this.coinSymbolToIds.get(symbol.toLowerCase());

        if (!ids) {
          ids = [id];
          this.coinSymbolToIds.set(symbol.toLowerCase(), ids);
          continue;
        }

        ids.push(id);
      }
    } catch (error) {}
  }

  async refresh() {
    if (Date.now() - this.lastRefreshedTimestamp < 1000 * 5 && !this.eth) return;

    try {
      const data = await getPrice();

      if (!data) {
        return;
      }

      const { ethereum } = data;

      runInAction(() => {
        this.eth = ethereum?.usd || 0;
        this.matic = data['matic-network']?.usd || 0;
        this.ftm = data['fantom']?.usd || 0;
        this.ht = data['huobi-token']?.usd || 0;
        this.okt = data['okexchain']?.usd || 0;
        this.bnb = data['binancecoin']?.usd || 0;
        this.avax = data['avalanche-2']?.usd || 0;
        this.celo = data['celo']?.usd || 0;
        this.cro = data['crypto-com-chain']?.usd || 0;
        this.one = data['harmony']?.usd || 0;
        this.movr = data['moonriver']?.usd || 0;
        this.glmr = data['moonbeam']?.usd || 0;
        this.wbtc = data['wrapped-bitcoin']?.usd || 0;
        this.klay = data['klay-token']?.usd || 0;
        this.fra = data['findora']?.usd || 0;
        this.ron = data['ronin']?.usd || 0;
      });
    } catch {}
  }

  async getCoinDetails(symbol: string, address: string, network: string) {
    await this.init();

    const ids = this.coinSymbolToIds.get(symbol.toLowerCase()) || [];
    address = address.toLowerCase();
    network = network.toLowerCase();

    let coin = this.coinDetails.get(address || symbol.toLowerCase());
    if (coin) return coin;

    try {
      for (let id of ids!) {
        coin = await getCoin(id);

        if (!coin) continue;
        if (ids.length === 1) return coin;

        const platforms = Object.getOwnPropertyNames(coin.platforms).filter((k) => k);

        if (platforms.length === 0 && !address && coin.name.toLowerCase() === network) return coin;
        if (platforms.length === 0) continue;

        const found = platforms.find((platform) => coin!.platforms[platform]?.toLowerCase() === address);
        if (found) return coin;

        const nativeToken = platforms.find((p) => coin!.platforms[id]?.toLowerCase() === symbol.toLowerCase());
        if (nativeToken) return coin;

        if (!address && coin.name.toLowerCase() === network) return coin;
      }
    } catch (error) {
    } finally {
      if (!coin) return;
      this.coinDetails.set(address || symbol.toLowerCase(), coin);
    }
  }

  getCoinIds(symbol: string) {
    return this.coinSymbolToIds.get(symbol.toLowerCase());
  }

  async getMarketChart(id: string, days = 1) {
    const tuple = this.coinIdToMarkets.get(id);
    if (tuple && tuple.timestamp > Date.now() - 1000 * 60 * 2) return tuple.market;

    try {
      const resp = await (
        await fetch(`${host}/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, { cache: 'force-cache' })
      ).json();

      const market = resp as CoinMarket;
      if (!market) return;

      this.coinIdToMarkets.set(id, { market, timestamp: Date.now() });
      return market;
    } catch (error) {}
  }
}

export default new Coingecko();

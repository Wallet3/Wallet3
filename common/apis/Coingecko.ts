import { makeAutoObservable, runInAction } from 'mobx';

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

  constructor() {
    makeAutoObservable(this);
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
}

export default new Coingecko();

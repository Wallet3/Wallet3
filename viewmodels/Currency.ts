import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../common/apis/Coingecko';
import { makeAutoObservable } from 'mobx';

interface Currency {
  currency: string;
  symbol: string;
  flag: string;
}

export class CurrencyViewmodel {
  currentCurrency: Currency | null = null;

  supportedCurrencies: Currency[] = [
    { currency: 'USD', symbol: '$', flag: 'usa' },
    { currency: 'ETH', symbol: 'Ξ', flag: 'eth' },
  ];

  constructor() {
    makeAutoObservable(this);
    Coingecko.start();

    AsyncStorage.getItem('currency').then((currency) => {
      this.currentCurrency = this.supportedCurrencies.find((c) => c.currency === currency) || this.supportedCurrencies[0];
    });
  }

  setCurrency(currency: Currency) {
    this.currentCurrency = currency;
    AsyncStorage.setItem('currency', currency.currency);
  }

  format(usd: number) {
    let value = 0;
    switch (this.currentCurrency!.currency) {
      case 'USD':
        value = usd;
        break;
      case 'ETH':
        value = usd / this.ethPrice;
        break;
    }

    const formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${this.currentCurrency!.symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
  }

  tokenToUSD(amount: number | string, tokenSymbol: string) {
    return Number(amount) * this.getPrice(tokenSymbol);
    // try {
    // } catch (error) {
    //   return 0;
    // }
  }

  get ethPrice() {
    return Coingecko.eth || 1;
  }

  getPrice(symbol: string): number {
    return Coingecko[symbol.toLowerCase()] || 1;
  }
}

export default new CurrencyViewmodel();

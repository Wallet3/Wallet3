import { action, makeAutoObservable, makeObservable, observable } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../common/apis/Coingecko';

export interface Currency {
  currency: string;
  symbol: string;
  flag: string;
}

export class CurrencyViewmodel {
  currentCurrency: Currency;

  supportedCurrencies: Currency[] = [
    { currency: 'ETH', symbol: 'Ξ', flag: 'eth' },
    { currency: 'USD', symbol: '$', flag: 'usa' },
  ];

  constructor() {
    Coingecko.start();

    this.currentCurrency = this.supportedCurrencies[1];

    makeObservable(this, { currentCurrency: observable, setCurrency: action });

    AsyncStorage.getItem('currency').then((currency) => {
      this.currentCurrency = this.supportedCurrencies.find((c) => c.currency === currency) || this.supportedCurrencies[1];
    });
  }

  setCurrency(currency: Currency) {
    this.currentCurrency = currency;
    AsyncStorage.setItem('currency', currency.currency);
  }

  format = (usd: number) => {
    let value = this.usdToToken(usd);

    const formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${this.currentCurrency.symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
  };

  usdToToken(usd: number) {
    switch (this.currentCurrency.currency) {
      case 'USD':
        return usd;

      case 'ETH':
        return usd / this.ethPrice;
    }

    return usd;
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

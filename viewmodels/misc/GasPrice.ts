import { getGasPrice, getNextBlockBaseFee } from '../../common/RPC';
import { makeObservable, observable, runInAction } from 'mobx';

import { Gwei_1 } from '../../common/Constants';
import Networks from '../Networks';

class GasPrice {
  private timer?: NodeJS.Timeout;
  price = 0;

  constructor() {
    makeObservable(this, { price: observable });
  }

  async refresh() {
    clearTimeout(this.timer!);
    const { current } = Networks;

    const price = await getGasPrice(current.chainId);

    runInAction(() => (this.price = price === undefined ? this.price : price / Gwei_1));
    this.timer = setTimeout(() => this.refresh(), 1000 * 15);
  }

  stop() {
    clearTimeout(this.timer!);
  }
}

export default new GasPrice();

import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getGasPrice, getMaxPriorityFee, getNextBlockBaseFee } from '../../common/RPC';

import { Gwei_1 } from '../../common/Constants';
import LINQ from 'linq';
import Networks from '../Networks';

class GasPrice {
  private timer?: NodeJS.Timeout;
  current = 0;

  get currentGwei() {
    return this.current / Gwei_1;
  }

  constructor() {
    makeObservable(this, { current: observable, currentGwei: computed });
  }

  async refresh() {
    clearTimeout(this.timer!);
    const { current } = Networks;

    const price = current.eip1559
      ? LINQ.from(await Promise.all([getNextBlockBaseFee(current.chainId), getMaxPriorityFee(current.chainId)])).sum()
      : await getGasPrice(current.chainId);

    runInAction(() => (this.current = price === undefined ? this.current : price));
    this.timer = setTimeout(() => this.refresh(), (current.chainId === 1 ? 12 : 5) * 1000);
  }

  stop() {
    clearTimeout(this.timer!);
  }
}

export default new GasPrice();

import { action, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import GasPrice from '../misc/GasPrice';

class UI {
  gasIndicator = false;
  hideBalance = false;

  constructor() {
    makeObservable(this, {
      gasIndicator: observable,
      hideBalance: observable,
      switchGasIndicator: action,
      switchHideBalance: action,
    });

    AsyncStorage.getItem('gasIndicator').then((v) => runInAction(() => (this.gasIndicator = JSON.parse(v || 'false'))));
    AsyncStorage.getItem('hideBalance').then((v) => runInAction(() => (this.hideBalance = JSON.parse(v || 'false'))));
  }

  switchGasIndicator(on: boolean) {
    this.gasIndicator = on;
    AsyncStorage.setItem('gasIndicator', JSON.stringify(on));
    on ? GasPrice.refresh() : GasPrice.stop();
  }

  switchHideBalance() {
    this.hideBalance = !this.hideBalance;
    AsyncStorage.setItem('hideBalance', JSON.stringify(this.hideBalance));
  }
}

export default new UI();

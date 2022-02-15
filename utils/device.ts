import { computed, makeObservable, observable, runInAction } from 'mobx';

import { Dimensions } from 'react-native';

class ReactScreen {
  height: number;
  width: number;

  constructor() {
    const { height, width } = Dimensions.get('window');
    this.height = height;
    this.width = width;

    makeObservable(this, { height: observable, width: observable, isPortrait: computed });

    const updateScreenDimensions = () => {
      const { height, width } = Dimensions.get('window');

      runInAction(() => {
        this.height = height;
        this.width = width;
      });
    };

    Dimensions.addEventListener('change', updateScreenDimensions);
  }

  get isPortrait() {
    return this.height > this.width;
  }
}

export const ReactiveScreen = new ReactScreen();

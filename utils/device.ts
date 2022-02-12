import { makeObservable, observable, runInAction } from 'mobx';

import { Dimensions } from 'react-native';

export const isPortrait = () => {
  const dim = Dimensions.get('window');
  return dim.height >= dim.width;
};

class ReactScreen {
  height: number;
  width: number;

  constructor() {
    const { height, width } = Dimensions.get('window');
    this.height = height;
    this.width = width;

    makeObservable(this, { height: observable, width: observable });

    const updateScreenDimensions = () => {
      const { height, width } = Dimensions.get('window');

      runInAction(() => {
        this.height = height;
        this.width = width;
      });
    };

    Dimensions.addEventListener('change', updateScreenDimensions);
  }
}

export const ReactiveScreen = new ReactScreen();

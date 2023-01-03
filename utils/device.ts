import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import DeviceInfo from 'react-native-device-info';
import { Dimensions } from 'react-native';
import EventEmitter from 'events';

class ReactScreen extends EventEmitter {
  height: number;
  width: number;
  safeAreaBottom = 0;

  constructor() {
    super();

    const { height, width } = Dimensions.get('window');
    this.height = height;
    this.width = width;

    makeObservable(this, {
      height: observable,
      width: observable,
      safeAreaBottom: observable,
      isPortrait: computed,
      setSafeAreaBottom: action,
    });

    const updateScreenDimensions = () => {
      const { height, width } = Dimensions.get('window');

      runInAction(() => {
        this.height = height;
        this.width = width;
        this.emit('change');
      });
    };

    Dimensions.addEventListener('change', updateScreenDimensions);
  }

  get isPortrait() {
    return this.height > this.width;
  }

  setSafeAreaBottom(bottom: number) {
    if (bottom === this.safeAreaBottom || bottom === 0) return;
    this.safeAreaBottom = bottom;
  }
}

export const ReactiveScreen = new ReactScreen();

let maxMemory = 0;

export async function getMemorySize() {
  if (maxMemory) return maxMemory;

  const memory = await DeviceInfo.getTotalMemory();
  maxMemory = Math.ceil(memory / 1024 / 1024);

  return maxMemory;
}

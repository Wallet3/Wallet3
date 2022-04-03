import { computed, makeObservable, observable, runInAction } from 'mobx';

import DeviceInfo from 'react-native-device-info';
import { Dimensions } from 'react-native';
import EventEmitter from 'events';

class ReactScreen extends EventEmitter {
  height: number;
  width: number;

  constructor() {
    super();

    const { height, width } = Dimensions.get('window');
    this.height = height;
    this.width = width;

    makeObservable(this, { height: observable, width: observable, isPortrait: computed });

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
}

export const ReactiveScreen = new ReactScreen();

let maxMemory = 0;

export async function getMemorySize() {
  if (maxMemory) return maxMemory;

  const memory = await DeviceInfo.getTotalMemory();
  maxMemory = Math.ceil(memory / 1024 / 1024);

  return maxMemory;
}

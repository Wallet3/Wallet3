import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Networks from '../Networks';

const LightTheme = {
  backgroundColor: '#fff',
  foregroundColor: '#000000',
  textColor: '#333333',
  secondaryTextColor: '#999999',
  thirdTextColor: '#75869c',
  borderColor: '#efefef',
  defaultTintColor: '#6186ff',
};

const DarkTheme = {
  backgroundColor: '#18171b',
  foregroundColor: '#ffffff',
  textColor: '#efefefcc',
  secondaryTextColor: '#999999',
  thirdTextColor: '#75869c',
  borderColor: '#333333',
  defaultTintColor: '#6186ff',
};

class Theme {
  mode: 'light' | 'dark' = 'light';

  constructor() {
    makeObservable(this, {
      mode: observable,
      backgroundColor: computed,
      foregroundColor: computed,
      textColor: computed,
      secondaryTextColor: computed,
      thirdTextColor: computed,
      borderColor: computed,
      tintColor: computed,
      statusBarStyle: computed,
      isLightMode: computed,
      setTheme: action,
    });

    AsyncStorage.getItem('theme')
      .then((v) => runInAction(() => this.setTheme((v as any) || 'light')))
      .catch(() => {});
  }

  setTheme(mode: 'light' | 'dark') {
    if (this.mode === mode) return;

    this.mode = mode;
    AsyncStorage.setItem('theme', mode);
  }

  get isLightMode() {
    return this.mode === 'light';
  }

  get backgroundColor() {
    return this.isLightMode ? LightTheme.backgroundColor : DarkTheme.backgroundColor;
  }

  get foregroundColor() {
    return this.isLightMode ? LightTheme.foregroundColor : DarkTheme.foregroundColor;
  }

  get textColor() {
    return this.isLightMode ? LightTheme.textColor : DarkTheme.textColor;
  }

  get secondaryTextColor() {
    return this.isLightMode ? LightTheme.secondaryTextColor : DarkTheme.secondaryTextColor;
  }

  get thirdTextColor() {
    return this.isLightMode ? LightTheme.thirdTextColor : DarkTheme.thirdTextColor;
  }

  get borderColor() {
    return this.isLightMode ? LightTheme.borderColor : `${Networks.current.color}30`;
  }

  get systemBorderColor() {
    return this.isLightMode ? 'rgb(216,216,216)' : `${Networks.current.color}30`;
  }

  get tintColor() {
    return Networks.current.color;
  }

  get statusBarStyle() {
    return this.isLightMode ? 'dark' : 'light';
  }
}

export default new Theme();

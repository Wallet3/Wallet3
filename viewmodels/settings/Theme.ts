import { computed, makeObservable, observable } from 'mobx';

const LightTheme = {
  backgroundColor: '#fff',
  foregroundColor: '#000',
  textColor: '#333',
  secondaryTextColor: '#999',
  thirdTextColor: '#75869c',
  borderColor: '#efefef',
  defaultTintColor: '#6186ff',
};

const DarkTheme = {
  backgroundColor: '#000',
  foregroundColor: '#fff',
  textColor: '#fff',
  secondaryTextColor: '#999',
  thirdTextColor: '#75869c',
  borderColor: '#333',
  defaultTintColor: '#6186ff',
};

class Theme {
  mode: 'light' | 'dark' | 'system' = 'dark';

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
    });
  }

  get isLightMode() {
    return this.mode === 'light';
  }

  get backgroundColor() {
    return this.mode === 'light' ? LightTheme.backgroundColor : DarkTheme.backgroundColor;
  }

  get foregroundColor() {
    return this.mode === 'light' ? LightTheme.foregroundColor : DarkTheme.foregroundColor;
  }

  get textColor() {
    return this.mode === 'light' ? LightTheme.textColor : DarkTheme.textColor;
  }

  get secondaryTextColor() {
    return this.mode === 'light' ? LightTheme.secondaryTextColor : DarkTheme.secondaryTextColor;
  }

  get thirdTextColor() {
    return this.mode === 'light' ? LightTheme.thirdTextColor : DarkTheme.thirdTextColor;
  }

  get borderColor() {
    return this.mode === 'light' ? LightTheme.borderColor : DarkTheme.borderColor;
  }

  get tintColor() {
    return this.mode === 'light' ? LightTheme.defaultTintColor : DarkTheme.defaultTintColor;
  }

  get statusBarStyle() {
    return this.mode === 'light' ? 'dark' : 'light';
  }
}

export default new Theme();

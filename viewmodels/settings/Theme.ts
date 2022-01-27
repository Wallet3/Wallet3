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
  backgroundColor: '#18171b',
  foregroundColor: '#fff',
  textColor: '#efefefcc',
  secondaryTextColor: '#999',
  thirdTextColor: '#75869c',
  borderColor: '#333',
  defaultTintColor: '#6186ff',
};

class Theme {
  mode: 'light' | 'dark' = 'dark';

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
    return this.isLightMode ? LightTheme.borderColor : DarkTheme.borderColor;
  }

  get tintColor() {
    return this.isLightMode ? LightTheme.defaultTintColor : DarkTheme.defaultTintColor;
  }

  get statusBarStyle() {
    return this.isLightMode ? 'dark' : 'light';
  }
}

export default new Theme();

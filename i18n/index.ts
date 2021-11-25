import * as Localization from 'expo-localization';

import en from './langs/en.json';
import i18n from 'i18n-js';
import zh_cn from './langs/zh-cn.json';
import zh_tw from './langs/zh-tw.json';

// Set the key-value pairs for the different languages you want to support.
i18n.translations = {
  en,
  'zh-tw': zh_tw,
  'zh-cn': zh_cn,
};

i18n.defaultLocale = 'en';
// Set the locale once at the beginning of your app.
i18n.locale = Localization.locale;
// When a value is missing from a language it'll fallback to another language with the key present.
i18n.fallbacks = true;

export default i18n;

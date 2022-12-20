import * as StoreReview from 'expo-store-review';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from '../auth/Authentication';
import TxHub from '../hubs/TxHub';
import { logAppReview } from './Analytics';
import { sleep } from '../../utils/async';

const Keys = {
  userRated: 'app_store_user_rated',
};

class AppStoreReview {
  constructor() {
    if (__DEV__) {
      AsyncStorage.removeItem(Keys.userRated);
    }
  }

  async check() {
    if (TxHub.txs.length < (__DEV__ ? 3 : 20)) return;
    if (!TxHub.txs.slice(0, 5).every((t) => t.status)) return;

    const rated = Number(await AsyncStorage.getItem(Keys.userRated)) || 0;
    if (Date.now() < rated + 365 * 24 * 60 * 60 * 1000) return; // inform users to submit a review per year

    if (!(await StoreReview.isAvailableAsync())) return;

    do {
      await sleep(5000);
    } while (!Authentication.appAuthorized);

    try {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(Keys.userRated, `${Date.now()}`);
      logAppReview();
    } catch (e) {}
  }
}

export default new AppStoreReview();

import * as StoreReview from 'expo-store-review';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from '../auth/Authentication';
import TxHub from '../hubs/TxHub';
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
    if (TxHub.txs.length < 20) return;
    if (TxHub.txs.slice(0, 5).some((t) => !t.status)) return;

    const rated = await AsyncStorage.getItem(Keys.userRated);
    if (rated) return;

    if (!(await StoreReview.isAvailableAsync())) return;

    do {
      await sleep(5000);
    } while (!Authentication.appAuthorized);

    try {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(Keys.userRated, 'true');
    } catch (e) {}
  }
}

export default new AppStoreReview();

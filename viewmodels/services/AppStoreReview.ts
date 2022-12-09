import * as StoreReview from 'expo-store-review';

import AsyncStorage from '@react-native-async-storage/async-storage';
import TxHub from '../hubs/TxHub';
import { sleep } from '../../utils/async';

const Keys = {
  userRated: 'app_store_user_rated',
};

class AppStoreReview {
  async check() {
    const rated = await AsyncStorage.getItem(Keys.userRated);
    if (rated) return;

    if (!(await StoreReview.isAvailableAsync())) return;
    if (TxHub.txs.length === 0) return;

    await sleep(2000);
    
    await StoreReview.requestReview();
    await AsyncStorage.setItem(Keys.userRated, 'true');
  }
}

export default new AppStoreReview();

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAY } from '../../utils/time';
import MessageKeys from '../../common/MessageKeys';
import { WalletBase } from '../wallet/WalletBase';

export async function tipWalletUpgrade(wallet?: WalletBase) {
  if (!wallet || wallet.isMultiSig || !wallet.isHDWallet) return;

  const key = `upgrade-wallet-tip-at-${wallet.keyInfo.id}`;
  const lastTip = Number((await AsyncStorage.getItem(key)) || '0');

  try {
    if (Date.now() < (__DEV__ ? 0 : lastTip + 30 * DAY)) return;
    setTimeout(() => PubSub.publish(MessageKeys.openUpgradeWalletTip), 2000);
  } finally {
    AsyncStorage.setItem(key, `${Date.now()}`);
  }
}

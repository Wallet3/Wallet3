import { AsyncLocalStorage } from 'async_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAY } from '../../../utils/time';
import MultiSigKey from '../../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../../wallet/MultiSigWallet';
import { WalletBase } from '../../wallet/WalletBase';
import { openInactiveDevicesTip } from '../../../common/Modals';

export enum SecurityLevel {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

const Keys = {
  lastInactiveDevicesCheckTimestamp: (walletId: string | number) => `${walletId}_last_inactive_devices_timestamp_check`,
};

class KeySecurity {
  async checkInactiveDevices(wallet?: WalletBase) {
    if (!wallet?.isMultiSig) return;

    const expired = Date.now() - (__DEV__ ? 10 : 30 * DAY);
    const inactiveDevices = (wallet as MultiSigWallet).key.secretsInfo.devices.filter((i) => i.lastUsedAt < expired);
    if (inactiveDevices.length === 0) return;

    const lastCheck = Number((await AsyncStorage.getItem(Keys.lastInactiveDevicesCheckTimestamp(wallet.keyInfo.id))) || 0);
    lastCheck < Date.now() - 7 * DAY && openInactiveDevicesTip({ devices: inactiveDevices });
    AsyncStorage.setItem(Keys.lastInactiveDevicesCheckTimestamp(wallet.keyInfo.id), `${Date.now()}`);
  }

  checkSecurityLevel(key: MultiSigKey) {
    const expired = Date.now() - 30 * DAY;
    const notUsedDevices = (key.secretsInfo.devices || []).filter((v) => v.lastUsedAt < expired);
    const thresholdRate = key.secretsInfo.threshold / (key.secretsInfo.devices.length + 1);

    let score = 0;

    score += notUsedDevices.length === 0 ? 5 : 0;
    score += thresholdRate >= 0.6 && thresholdRate <= 0.9 ? 5 : 0;
    score += thresholdRate <= 0.5 ? -2 : 0;

    if (score >= 5) {
      return SecurityLevel.high;
    } else if (score >= 3 && score < 5) {
      return SecurityLevel.medium;
    } else {
      return SecurityLevel.low;
    }
  }
}

export default new KeySecurity();

import { autorun, reaction } from 'mobx';

import App from '../../core/App';
import { DAY } from '../../../utils/time';
import Database from '../../../models/Database';
import MultiSigKey from '../../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../../wallet/MultiSigWallet';
import { openDeviceExpiredTip } from '../../../common/Modals';

export enum SecurityLevel {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

class KeySecurity {
  init() {
    reaction(
      () => App.currentWallet,
      () => {
        const { currentWallet } = App;
        if (!currentWallet?.isMultiSig) return;

        const expired = Date.now() - 30 * DAY;
        const expiredDevices = (currentWallet as MultiSigWallet).key.secretsInfo.devices.filter((i) => i.lastUsedAt < expired);
        if (expiredDevices.length === 0) return;

        openDeviceExpiredTip({ devices: expiredDevices });
      }
    );
  }

  check(key: MultiSigKey) {
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

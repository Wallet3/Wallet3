import { autorun, reaction } from 'mobx';

import App from '../../core/App';
import { DAY } from '../../../utils/time';
import Database from '../../../models/Database';
import MultiSigKey from '../../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../../wallet/MultiSigWallet';

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
        this.check((currentWallet as MultiSigWallet).key);
      }
    );
  }

  check(key: MultiSigKey) {
    const expired = Date.now() - 30 * DAY;
    const notUsedDevices = (key.secretsInfo.devices || []).filter((v) => v.lastUsedAt < expired);
    const thresholdRate = key.secretsInfo.threshold / (key.secretsInfo.devices.length + 1);
    console.log(key.secretsInfo.threshold, thresholdRate);
    let score = 0;

    score += notUsedDevices.length === 0 ? 5 : 0;
    score += thresholdRate >= 0.6 && thresholdRate <= 0.9 ? 5 : 0;
    score += thresholdRate <= 0.5 ? -2 : 0;
    score += thresholdRate > 0.999 ? -2 : 0;

    if (score >= 10) {
      return SecurityLevel.high;
    } else if (score >= 3) {
      return SecurityLevel.medium;
    } else {
      return SecurityLevel.low;
    }
  }
}

export default new KeySecurity();

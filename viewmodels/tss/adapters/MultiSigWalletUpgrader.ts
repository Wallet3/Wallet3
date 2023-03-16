import App from '../../core/App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DistributorForUpgrading } from './ShardsDistributorForUpgrading';
import MultiSigKey from '../../../models/entities/MultiSigKey';
import { SingleSigWallet } from '../../wallet/SingleSigWallet';
import { WalletBaseKeys } from '../../wallet/WalletBase';
import { logUpgradedToMultiSigWallet } from '../../services/Analytics';
import { openShardsDistributors } from '../../../common/Modals';

export class MultiSigWalletUpgrader {
  private singleSigWallet: SingleSigWallet;
  private mnemonic: string;

  constructor(singleSigWallet: SingleSigWallet, mnemonic: string) {
    this.singleSigWallet = singleSigWallet;
    this.mnemonic = mnemonic;
  }

  execUpgrade() {
    const vm = new DistributorForUpgrading({
      mnemonic: this.mnemonic,
      ...this.singleSigWallet!.keyInfo,
      upgradeCallback: this.upgradeCallback,
    });

    openShardsDistributors({ vm });
  }

  protected upgradeCallback = async (key?: MultiSigKey) => {
    if (!key) return;

    const [indexes, count] = await Promise.all([
      AsyncStorage.getItem(WalletBaseKeys.removedEOAIndexes(this.singleSigWallet.keyInfo.id)),
      AsyncStorage.getItem(WalletBaseKeys.addressCount(this.singleSigWallet.keyInfo.id)),
    ]);

    await Promise.all([
      indexes ? AsyncStorage.setItem(WalletBaseKeys.removedEOAIndexes(key.id), indexes) : undefined,
      count ? AsyncStorage.setItem(WalletBaseKeys.addressCount(key.id), count) : undefined,
    ]);

    await App.removeWallet(this.singleSigWallet);
    await App.addWallet(key);

    logUpgradedToMultiSigWallet({ threshold: `${key.secretsInfo.threshold}/${key.secretsInfo.devices.length}` });
  };
}

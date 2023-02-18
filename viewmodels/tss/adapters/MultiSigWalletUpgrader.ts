import App from '../../core/App';
import { DistributorForUpgrading } from './ShardsDistributorForUpgrading';
import MultiSigKey from '../../../models/entities/MultiSigKey';
import { SingleSigWallet } from '../../wallet/SingleSigWallet';
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
    await App.removeWallet(this.singleSigWallet);
    await App.addWallet(key);
  };
}

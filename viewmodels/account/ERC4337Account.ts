import { makeObservable, observable, runInAction } from 'mobx';

import { AccountBase } from './AccountBase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCode } from '../../common/RPC';

const Keys = {
  accountActivated: (address: string, chainId: number) => `${chainId}_${address}_erc4337_activated`,
  activated: 'activated',
};

export class ERC4337Account extends AccountBase {
  readonly type = 'erc4337';
  readonly activatedChains = new Map<number, boolean>();

  constructor(address: string, index: number, extra?: { signInPlatform?: string }) {
    super(address, index, extra);
    makeObservable(this, { activatedChains: observable });
  }

  async checkActivated(chainId: number) {
    if (this.activatedChains.get(chainId)) return true;

    const info = await AsyncStorage.getItem(Keys.accountActivated(this.address, chainId));
    if (info === Keys.activated) {
      runInAction(() => this.activatedChains.set(chainId, true));
      return true;
    }

    const code = await getCode(chainId, this.address);
    if (!code || code === '0x') return false;

    runInAction(() => this.activatedChains.set(chainId, true));
    AsyncStorage.setItem(Keys.accountActivated(this.address, chainId), Keys.activated);
    return true;
  }
}

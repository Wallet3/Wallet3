import { makeObservable, observable, runInAction } from 'mobx';

import { AccountBase } from './AccountBase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCode } from '../../common/RPC';

const Keys = {
  accountActivated: (address: string, chainId: number) => `${chainId}_${address}_erc4337_activated`,
};

export class ERC4337Account extends AccountBase {
  readonly type = 'erc4337';

  activated = false;

  constructor(address: string, index: number, extra?: { signInPlatform?: string }) {
    super(address, index, extra);
    makeObservable(this, { activated: observable });
  }

  async checkActivated(chainId: number) {
    const info = await AsyncStorage.getItem(Keys.accountActivated(this.address, chainId));

    if (info === 'activated') {
      runInAction(() => (this.activated = true));
      return;
    }

    const code = await getCode(chainId, this.address);
    if (!code || code === '0x') return;

    runInAction(() => (this.activated = true));
    AsyncStorage.setItem(Keys.accountActivated(this.address, chainId), 'activated');
  }
}

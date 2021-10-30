import * as Debank from '../common/apis/Debank';

import { makeObservable, observable, runInAction } from 'mobx';

import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { getBalance } from '../common/RPC';

export class Account {
  readonly address: string;
  readonly index: number;

  tokens: IToken[] = [];
  balanceUSD: number = 0;

  constructor(address: string, index: number) {
    this.address = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'; // address;
    this.index = index;

    console.log(address, index);

    makeObservable(this, { tokens: observable });
  }

  async refreshOverview() {
    const { usd_value } = await Debank.getBalance(this.address, Networks.current.comm_id);
    runInAction(() => (this.balanceUSD = usd_value));
  }

  async fetchBasicInfo() {
    // await getBalance(Networks.current.chainId, this.address);
    // console.log(await Networks.currentProvider.getBalance(this.address));
    // console.log(await Networks.currentProvider.getAvatar('brantly.eth'));
    // console.log(await Networks.currentProvider.getAvatar('nick.eth'));

    if (Networks.current.chainId !== 1) return;
    const resolver = (await Networks.currentProvider.getResolver('nick.eth'))!;
    
    console.log(await resolver.getAddress());
    console.log(await resolver.getAvatar());
  }
}

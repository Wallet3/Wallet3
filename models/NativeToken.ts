import { BigNumber, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getBalance } from '../common/RPC';

import { IFungibleToken } from './Interfaces';

export class NativeToken implements IFungibleToken {
  owner: string;
  readonly decimals = 18;
  readonly address = '';

  chainId: number = 1;
  symbol: string = '';
  balance = BigNumber.from(0);
  loading = false;

  get amount() {
    return this.balance.eq(0) ? '0' : utils.formatUnits(this.balance, this.decimals);
  }

  constructor({ owner, chainId, symbol }: { owner: string; chainId: number; symbol: string }) {
    this.owner = owner;
    this.chainId = chainId;
    this.symbol = symbol;

    makeObservable(this, {
      balance: observable,
      amount: computed,
      symbol: observable,
      setChain: action,
      loading: observable,
      getBalance: action,
    });
  }

  setChain({ chainId, symbol }: { chainId: number; symbol: string }) {
    this.chainId = chainId;
    this.symbol = symbol;
    this.balance = BigNumber.from(0);
  }

  async getBalance(setLoading: boolean = true) {
    this.loading = setLoading;

    const balance = await getBalance(this.chainId, this.owner);

    runInAction(() => {
      this.balance = balance;
      this.loading = false;
    });

    return balance;
  }

  async estimateGas(to: string, data = '0x') {
    return await estimateGas(this.chainId, {
      from: this.owner,
      to,
      value: '0x0',
      data,
    });
  }

  setOwner(owner: string) {
    this.owner = owner;
  }

  async allowance(owner: string, spender: string, force = false): Promise<BigNumber> {
    return BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639936');
  }
}

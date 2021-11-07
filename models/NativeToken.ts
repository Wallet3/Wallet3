import { BigNumber, utils } from 'ethers';
import { action, computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getBalance } from '../common/RPC';

import { IToken } from '../common/Tokens';
import { hexlify } from '@ethersproject/bytes';

export class NativeToken implements IToken {
  readonly owner: string;
  readonly decimals = 18;
  readonly address = '';

  chainId: number = 1;
  symbol: string = '';
  balance = BigNumber.from(0);
  loading = false;
  busy = false;

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
      busy: observable,
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
    this.busy = true;

    const balance = await getBalance(this.chainId, this.owner);

    runInAction(() => {
      this.balance = balance;
      this.loading = false;
      this.busy = false;
    });
  }

  async estimateGas(to: string) {
    return await estimateGas(this.chainId, {
      from: this.owner,
      to,
      value: '0x0',
      data: '0x',
    });
  }
}

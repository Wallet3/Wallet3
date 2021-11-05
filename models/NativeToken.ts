import { BigNumber, utils } from 'ethers';
import { computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getBalance } from '../common/RPC';

import { IToken } from '../common/Tokens';

export class NativeToken implements IToken {
  readonly owner: string;
  readonly chainId: number;
  readonly symbol: string;
  readonly decimals = 18;
  readonly address = '';

  balance = BigNumber.from(0);

  get amount() {
    return utils.formatUnits(this.balance, this.decimals);
  }

  constructor({ owner, chainId, symbol }: { owner: string; chainId: number; symbol: string }) {
    this.owner = owner;
    this.chainId = chainId;
    this.symbol = symbol;

    makeObservable(this, { balance: observable, amount: computed });
  }

  async getBalance() {
    const balance = await getBalance(this.chainId, this.owner);
    runInAction(() => (this.balance = balance));
  }

  async estimateGas(to: string, wei: BigNumber) {
    const gas = await estimateGas(this.chainId, {
      from: this.owner,
      to,
      value: wei.toString(),
      data: '0x',
    });

    return Number(gas || 21000);
  }
}

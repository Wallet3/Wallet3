import { BigNumber, BigNumberish, ethers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import ERC20ABI from '../abis/ERC20.json';

export class ERC20Token {
  private owner = '';
  readonly address: string;
  readonly erc20: ethers.Contract;

  name = '';
  symbol = '';
  decimals = -1;
  price = 0;
  balance = BigNumber.from(0);
  minGas?: number;
  iconUrl?: string;

  loading = false;

  get interface() {
    return this.erc20.interface;
  }

  get amount() {
    return utils.formatUnits(this.balance, this.decimals < 0 ? 18 : this.decimals);
  }

  constructor(props: {
    contract: string;
    owner: string;
    chainId: number;
    provider?: ethers.providers.BaseProvider;
    name?: string;
    symbol?: string;
    decimals?: number;
    price?: number;
    minGas?: number;
    iconUrl?: string;
  }) {
    this.address = props.contract;
    this.erc20 = new ethers.Contract(this.address, ERC20ABI, props.provider);

    this.symbol = props.symbol || '';
    this.name = props.name || '';
    this.decimals = props.decimals || -1;
    this.price = props.price || 0;
    this.minGas = props.minGas;
    this.iconUrl = props.iconUrl;
    this.owner = props.owner || '';

    makeObservable(this, {
      name: observable,
      symbol: observable,
      balance: observable,
      decimals: observable,
      amount: computed,
      loading: observable,
      getBalance: action,
    });
  }

  async getBalance(): Promise<BigNumber> {
    this.loading = true;
    const balance = await this.erc20.balanceOf(this.owner);

    runInAction(() => {
      this.balance = balance;
      this.loading = false;
    });

    return balance;
  }

  allowance(owner: string, spender: string): Promise<BigNumber> {
    return this.erc20.allowance(owner, spender);
  }

  async getName(): Promise<string> {
    if (this.name) return this.name;
    const name = await this.erc20.name();
    runInAction(() => (this.name = name));
    return name;
  }

  async getDecimals(): Promise<number> {
    if (this.decimals >= 0) return this.decimals;
    const decimals = await this.erc20.decimals();
    runInAction(() => (this.decimals = decimals));
    return decimals;
  }

  async getSymbol(): Promise<string> {
    if (this.symbol) return this.symbol;
    const symbol = await this.erc20.symbol();
    runInAction(() => (this.symbol = symbol));
    return symbol;
  }

  get filters() {
    return this.erc20.filters;
  }

  on(filter: string | ethers.EventFilter, listener: ethers.providers.Listener) {
    this.erc20.on(filter, listener);
  }

  async estimateGas(from: string, to: string, amt: BigNumberish = BigNumber.from(0), l2?: boolean) {
    try {
      return Number.parseInt(((await this.erc20.estimateGas.transfer(to, amt)).toNumber() * 2) as any);
    } catch (error) {}

    try {
      return Number.parseInt(((await this.erc20.estimateGas.transferFrom(from, to, amt)).toNumber() * 3) as any);
    } catch (error) {}

    return 150_000 + (l2 ? 1_000_000 : 0);
  }

  encodeTransferData(to: string, amount: BigNumberish) {
    return this.interface.encodeFunctionData('transfer', [to, amount]);
  }

  encodeApproveData(spender: string, amount: BigNumberish) {
    return this.interface.encodeFunctionData('approve', [spender, amount]);
  }
}

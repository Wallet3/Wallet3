import { BigNumber, BigNumberish, ethers } from 'ethers';
import { makeObservable, observable } from 'mobx';

import ERC20ABI from '../abis/ERC20.json';

export class ERC20Token {
  readonly address: string;
  readonly erc20: ethers.Contract;

  name = '';
  symbol = '';
  decimals = -1;
  price = 0;
  balance = BigNumber.from(0);
  minGas?: number;

  get interface() {
    return this.erc20.interface;
  }

  constructor(props: {
    contract: string;
    provider: ethers.providers.BaseProvider;
    name?: string;
    symbol?: string;
    decimals?: number;
    price?: number;
    minGas?: number;
  }) {
    this.address = props.contract;
    this.erc20 = new ethers.Contract(this.address, ERC20ABI, props.provider);

    this.symbol = props.symbol || '';
    this.name = props.name || '';
    this.decimals = props.decimals || -1;
    this.price = props.price || 0;
    this.minGas = props.minGas;

    makeObservable(this, { name: observable, symbol: observable, balance: observable, decimals: observable });
  }

  async balanceOf(guy: string): Promise<BigNumber> {
    this.balance = await this.erc20.balanceOf(guy);
    return this.balance;
  }

  allowance(owner: string, spender: string): Promise<BigNumber> {
    return this.erc20.allowance(owner, spender);
  }

  async getName(): Promise<string> {
    if (this.name) return this.name;
    this.name = await this.erc20.name();
    return this.name;
  }

  async getDecimals(): Promise<number> {
    if (this.decimals >= 0) return this.decimals;
    this.decimals = await this.erc20.decimals();
    return this.decimals;
  }

  async getSymbol(): Promise<string> {
    if (this.symbol) return this.symbol;
    this.symbol = await this.erc20.symbol();
    return this.symbol;
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

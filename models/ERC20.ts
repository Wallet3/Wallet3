import { BigNumber, BigNumberish, ethers, utils } from 'ethers';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, eth_call } from '../common/RPC';

import ERC20ABI from '../abis/ERC20.json';

const call_symbol = '0x95d89b41';
const call_decimals = '0x313ce567';
const call_name = '0x06fdde03';

export class ERC20Token {
  private owner = '';
  readonly address: string;
  readonly erc20: ethers.Contract;
  readonly chainId: number;
  private call_balanceOfOwner = '';
  private allowanceMap = new Map<string, BigNumber>();

  name = '';
  symbol = '';
  decimals = -1;
  price = 0;
  balance = BigNumber.from(0);
  iconUrl?: string;
  shown?: boolean;
  order?: number;

  loading = false;

  get interface() {
    return this.erc20.interface;
  }

  get amount() {
    return this.balance.eq(0) ? '0' : utils.formatUnits(this.balance, this.decimals < 0 ? 18 : this.decimals);
  }

  constructor(props: {
    contract: string;
    owner: string;
    chainId: number;

    name?: string;
    symbol?: string;
    decimals?: number;
    price?: number;
    iconUrl?: string;
    shown?: boolean;
    order?: number;
  }) {
    this.address = props.contract;
    this.erc20 = new ethers.Contract(this.address, ERC20ABI);
    this.chainId = props.chainId;

    this.symbol = props.symbol || '';
    this.name = props.name || '';
    this.decimals = props.decimals || -1;
    this.price = props.price || 0;
    this.iconUrl = props.iconUrl;
    this.owner = props.owner || '';
    this.shown = props.shown;
    this.order = props.order;

    this.call_balanceOfOwner = this.erc20.interface.encodeFunctionData('balanceOf', [this.owner]);

    makeObservable(this, {
      name: observable,
      symbol: observable,
      balance: observable,
      decimals: observable,
      amount: computed,
      loading: observable,
      getBalance: action,
      shown: observable,
    });
  }

  async getBalance(setLoading = true): Promise<BigNumber> {
    this.loading = setLoading;

    let result: string = (await eth_call(this.chainId, { to: this.address, data: this.call_balanceOfOwner })) || '0';
    const balance = BigNumber.from(result.substring(0, 66));

    runInAction(() => {
      this.balance = balance;
      this.loading = false;
    });

    return balance;
  }

  async allowance(owner: string, spender: string, force = false): Promise<BigNumber> {
    if (!force) {
      const cache = this.allowanceMap.get(`${owner}-${spender}`);
      if (cache) return cache;
    }

    const data = this.erc20.interface.encodeFunctionData('allowance', [owner, spender]);
    const approved = BigNumber.from((await eth_call(this.chainId, { to: this.address, data })) || '0');

    this.allowanceMap.set(`${owner}-${spender}`, approved);
    return approved;
  }

  async getName(): Promise<string> {
    if (this.name) return this.name;

    const [name] = this.erc20.interface.decodeFunctionResult(
      'name',
      (await eth_call<string>(this.chainId, { to: this.address, data: call_name })) || ''
    ) as string[];

    runInAction(() => (this.name = name));
    return name;
  }

  async getDecimals(): Promise<number> {
    if (this.decimals >= 0) return this.decimals;

    const decimals = BigNumber.from(
      (await eth_call<string>(this.chainId, { to: this.address, data: call_decimals })) || '0'
    ).toNumber();

    runInAction(() => (this.decimals = decimals));
    return decimals;
  }

  async getSymbol(): Promise<string> {
    if (this.symbol) return this.symbol;

    const [symbol] = this.erc20.interface.decodeFunctionResult(
      'symbol',
      (await eth_call<string>(this.chainId, { to: this.address, data: call_symbol })) || ''
    );

    runInAction(() => (this.symbol = symbol));
    return symbol;
  }

  async estimateGas(to: string, amt: BigNumberish = BigNumber.from(0)) {
    return await estimateGas(this.chainId, {
      from: this.owner,
      to: this.address,
      data: this.encodeTransferData(to, amt),
    });
  }

  encodeTransferData(to: string, amount: BigNumberish) {
    return this.interface.encodeFunctionData('transfer', [to, amount]);
  }

  encodeApproveData(spender: string, amount: BigNumberish) {
    return this.interface.encodeFunctionData('approve', [spender, amount]);
  }

  setOwner(owner: string) {
    this.owner = owner;
  }
}

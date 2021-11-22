import { BigNumber, providers, utils } from 'ethers';
import { INetwork, PublicNetworks } from '../common/Networks';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import App from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseTransaction } from './BaseTransaction';
import { ERC20Token } from '../models/ERC20';
import { Gwei_1 } from '../common/Constants';
import { IToken } from '../common/Tokens';
import Networks from './Networks';
import { getGasPrice } from '../common/RPC';

export interface ERC681 {
  chain_id?: string;
  function_name?: string;
  parameters?: { address?: string; uint256?: string; value?: string };
  scheme: string;
  target_address: string;
}

export class TokenTransferring extends BaseTransaction {
  to = '';
  toAddress = '';
  avatar?: string = '';
  token: IToken;
  amount = '0';
  isResolvingAddress = false;

  get allTokens() {
    return [this.account.tokens[0], ...this.account.allTokens];
  }

  get isEns() {
    return !utils.isAddress(this.to);
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get amountWei() {
    try {
      if (this.isNativeToken) {
        const ether = utils.parseEther(this.amount);
        if (ether.eq(this.account.nativeToken.balance!)) {
          return BigNumber.from(this.account.nativeToken.balance!).sub(this.txFeeWei);
        }
      }

      return utils.parseUnits(this.amount, this.token.decimals || 18);
    } catch (error) {}

    return BigNumber.from(0);
  }

  get isValidAmount() {
    try {
      return this.amountWei.gt(0) && this.amountWei.lte(this.token.balance!) && !this.token.loading;
    } catch (error) {
      return false;
    }
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }

  get isNativeToken() {
    return !this.token.address;
  }

  get insufficientFee() {
    return this.isNativeToken
      ? this.amountWei.add(this.txFeeWei).gt(this.account.nativeToken.balance!)
      : this.txFeeWei.gt(this.account.nativeToken.balance!);
  }

  get isValidParams() {
    return (
      this.toAddress &&
      this.isValidAmount &&
      this.nonce >= 0 &&
      this.maxGasPrice > 0 &&
      this.gasLimit >= 21000 &&
      this.network &&
      !this.insufficientFee &&
      !this.token.loading &&
      !this.isEstimatingGas
    );
  }

  get txRequest(): providers.TransactionRequest {
    const data = this.isNativeToken ? '0x' : (this.token as ERC20Token).encodeTransferData(this.toAddress, this.amountWei);

    const tx: providers.TransactionRequest = {
      chainId: this.network.chainId,
      from: this.account.address,
      to: this.isNativeToken ? this.toAddress : this.token.address,
      value: this.isNativeToken ? this.amountWei : 0,
      nonce: this.nonce,
      data,
      gasLimit: this.gasLimit,
      type: this.network.eip1559 ? 2 : 0,
    };

    if (tx.type === 0) {
      tx.gasPrice = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
    } else {
      tx.maxFeePerGas = Number.parseInt((this.maxGasPrice * Gwei_1) as any);
      tx.maxPriorityFeePerGas = Number.parseInt((this.maxPriorityPrice * Gwei_1) as any);
    }

    return tx;
  }

  constructor({ targetNetwork, defaultToken, erc681 }: { targetNetwork: INetwork; defaultToken?: IToken; erc681?: ERC681 }) {
    const account = App.currentWallet!.currentAccount!;
    const network = erc681
      ? Networks.all.find((n) => n.chainId === Number(erc681.chain_id)) ?? Networks.Ethereum
      : targetNetwork;

    super({ account, network });
    console.log(erc681);
    const token = (
      erc681 && erc681.function_name === 'transfer' && utils.isAddress(erc681.target_address)
        ? new ERC20Token({ contract: erc681.target_address, owner: account.address, chainId: network.chainId })
        : erc681
        ? account.nativeToken
        : defaultToken
    ) as ERC20Token;

    this.token = token || this.account.tokens[0];

    if (erc681) {
      token?.getDecimals?.();
      token?.getSymbol?.();
      token?.getBalance?.(erc681.function_name ? true : false);
    }

    makeObservable(this, {
      to: observable,
      toAddress: observable,
      token: observable,
      amount: observable,
      isResolvingAddress: observable,
      insufficientFee: computed,
      isValidParams: computed,
      amountWei: computed,
      isValidAmount: computed,
      allTokens: computed,

      setTo: action,
      setAmount: action,
      setToken: action,
    });

    AsyncStorage.getItem(`${this.network.chainId}-${this.account.address}-LastUsedToken`).then((v) => {
      if (defaultToken) return;
      if (erc681) return;

      if (!v) {
        runInAction(() => this.setToken(this.account.tokens[0]));
        return;
      }

      const token = this.account.allTokens.find((t) => t.address === v) || this.account.tokens[0];
      runInAction(() => this.setToken(token));
    });

    if (!erc681) return;

    if (erc681.function_name === 'transfer') {
      this.setTo(erc681.parameters?.address);

      (this.token as ERC20Token)?.getDecimals?.()?.then((decimals) => {
        try {
          const amount = utils.formatUnits(erc681.parameters?.uint256 || '0', decimals);
          runInAction(() => {
            this.setAmount(amount);
            this.estimateGas();
          });
        } catch (error) {}
      });
    } else {
      try {
        this.setTo(erc681.target_address);
        this.setAmount(utils.formatEther(erc681.parameters?.value ?? '0'));
        this.estimateGas();
      } catch (error) {}
    }
  }

  async estimateGas() {
    if (!this.toAddress) return;

    runInAction(() => (this.isEstimatingGas = true));
    const { gas, errorMessage } = await (this.token as ERC20Token).estimateGas(this.toAddress, this.amountWei);
    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  async setTo(to?: string, avatar?: string) {
    if (to === undefined || to === null) return;

    to = to.trim();
    this.avatar = avatar;

    if (this.to.toLowerCase() === to.toLowerCase()) return;

    this.to = to;
    this.toAddress = '';
    this.txException = '';

    if (utils.isAddress(to)) {
      this.toAddress = to;
      this.isResolvingAddress = false;
      return;
    }

    if (!to.endsWith('.eth')) return;
    let provider = Networks.MainnetWsProvider;

    this.isResolvingAddress = true;
    const address = await provider.resolveName(to);

    runInAction(() => {
      this.toAddress = address || '';
      this.isResolvingAddress = false;
      provider.destroy();
    });
  }

  setToken(token: IToken) {
    console.log('setToken', token.symbol);
    if (this.token.address === token.address) return;

    this.token = token;
    this.txException = '';

    (token as ERC20Token)?.getBalance?.(false);
    AsyncStorage.setItem(`${this.network.chainId}-${this.account.address}-LastUsedToken`, token.address);
  }

  setAmount(amount: string) {
    this.amount = amount;
    this.txException = '';
  }
}

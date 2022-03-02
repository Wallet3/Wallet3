import { BigNumber, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../../common/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getGasPrice, getMaxPriorityFee, getNextBlockBaseFee, getTransactionCount } from '../../common/RPC';

import { Account } from '../account/Account';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../../common/apis/Coingecko';
import { ERC20Token } from '../../models/ERC20';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/Tokens';
import { NativeToken } from '../../models/NativeToken';
import { Wallet } from '../Wallet';

export class BaseTransaction {
  private timer?: NodeJS.Timer;

  readonly network: INetwork;
  readonly account: Account;
  readonly wallet: Wallet;
  readonly nativeToken: NativeToken;

  isEstimatingGas = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = 0;
  txException = '';
  initializing = false;
  feeToken: ERC20Token | null = null;

  constructor(args: { network: INetwork; account: Account }, initChainData = true) {
    this.network = args.network;
    this.account = args.account;
    this.wallet = App.findWallet(this.account.address)!.wallet;
    this.nativeToken = new NativeToken({ ...this.network, owner: this.account.address });

    makeObservable(this, {
      isEstimatingGas: observable,
      gasLimit: observable,
      nextBlockBaseFeeWei: observable,
      nextBlockBaseFee: computed,
      maxGasPrice: observable,
      maxPriorityPrice: observable,
      nonce: observable,
      txException: observable,
      txFee: computed,
      txFeeWei: computed,
      isValidGas: computed,
      initializing: observable,
      feeToken: observable,
      insufficientFee: computed,

      setNonce: action,
      setGasLimit: action,
      setMaxGasPrice: action,
      setPriorityPrice: action,
      setGas: action,
      setFeeToken: action,
    });

    this.nativeToken.getBalance();

    if (initChainData) this.initChainData({ ...args, account: args.account.address });

    if (this.network.eip1559) this.refreshEIP1559(this.network.chainId);
    if (this.network.feeTokens) this.initFeeToken();

    Coingecko.refresh();
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get txFeeWei() {
    try {
      const maxGasPriceWei = BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0));

      return this.network.eip1559
        ? maxGasPriceWei.add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0))).mul(this.gasLimit)
        : maxGasPriceWei.mul(this.gasLimit);
    } catch (error) {
      return BigNumber.from(0);
    }
  }

  get insufficientFee() {
    return this.txFeeWei.gt(this.nativeToken.balance);
  }

  get estimatedRealFeeWei() {
    try {
      const maxGasPriceWei = BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0));
      const nextBlockBaseFeeWei = BigNumber.from(this.nextBlockBaseFeeWei);

      return this.network.eip1559
        ? (nextBlockBaseFeeWei.gt(maxGasPriceWei) ? maxGasPriceWei : nextBlockBaseFeeWei)
            .add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0)))
            .mul(this.gasLimit)
        : maxGasPriceWei.mul(this.gasLimit);
    } catch (error) {
      return BigNumber.from(0);
    }
  }

  get txFee() {
    try {
      return Number(utils.formatEther(this.txFeeWei));
    } catch (error) {
      return 0;
    }
  }

  get feeTokenSymbol() {
    return this.feeToken?.symbol ?? this.network.symbol;
  }

  get estimatedRealFee() {
    try {
      return Number(utils.formatEther(this.estimatedRealFeeWei));
    } catch {
      return 0;
    }
  }

  get isValidGas() {
    return this.maxGasPrice >= 0 && this.maxGasPrice >= this.maxPriorityPrice && this.gasLimit >= 0;
  }

  setNonce(nonce: string | number) {
    this.nonce = Number(nonce) || this.nonce;
  }

  setGasLimit(limit: string | number) {
    try {
      this.gasLimit = Math.max(Math.min(Number.parseInt(limit as any), 100_000_000), 21000);
    } catch (error) {}
  }

  setMaxGasPrice(gwei: string | number) {
    try {
      this.maxGasPrice = Math.max(Math.min(Number(gwei), MAX_GWEI_PRICE), 0);
    } catch {}
  }

  setPriorityPrice(gwei: string | number) {
    try {
      this.maxPriorityPrice = Math.max(Math.min(Number(gwei), MAX_GWEI_PRICE), 0);
    } catch (error) {}
  }

  setFeeToken(token: IToken) {
    if (!this.network.feeTokens) return;
    const feeToken = this.network.feeTokens.find((t) => t.address === token.address) ?? this.network.feeTokens[0];
    this.feeToken = new ERC20Token({ ...this.network, ...feeToken, owner: this.account.address, contract: feeToken.address });
    this.feeToken.getBalance();
    AsyncStorage.setItem(`${this.network.chainId}_feeToken`, this.feeToken.address);
  }

  async setGas(speed: 'rapid' | 'fast' | 'standard') {
    const { eip1559, chainId } = this.network;
    const wei = (await getGasPrice(chainId)) || Gwei_1;
    const basePrice = wei / Gwei_1;

    let priPrice = 0;

    if (eip1559) {
      const priWei = (await getMaxPriorityFee(chainId)) || 0;
      priPrice = priWei / Gwei_1;
    }

    runInAction(() => {
      switch (speed) {
        case 'rapid':
          this.setMaxGasPrice(basePrice + (this.network.eip1559 ? priPrice : 0) + 10);
          if (eip1559) this.setPriorityPrice(priPrice + 3);
          break;
        case 'fast':
          this.setMaxGasPrice(basePrice);
          if (eip1559) this.setPriorityPrice(priPrice + 1);
          break;
        case 'standard':
          this.setMaxGasPrice(Math.max(basePrice - 3, 1));
          if (eip1559) this.setPriorityPrice(priPrice);
          break;
      }
    });
  }

  dispose() {
    clearTimeout(this.timer as any);
  }

  protected async initChainData({ network, account }: { network: INetwork; account: string }) {
    const { chainId, eip1559 } = network;

    runInAction(() => (this.initializing = true));

    const [gasPrice, nextBaseFee, priorityFee, nonce] = await Promise.all([
      getGasPrice(chainId),
      getNextBlockBaseFee(chainId),
      getMaxPriorityFee(chainId),
      getTransactionCount(chainId, account),
    ]);

    runInAction(() => {
      this.nextBlockBaseFeeWei = Number(nextBaseFee.toFixed(0));

      this.setNonce(nonce);

      if (eip1559) {
        const priFee = (priorityFee || Gwei_1) / Gwei_1 + (chainId === 1 ? 0.2 : 0.01);
        this.setPriorityPrice(priFee);

        const maxPrice = (nextBaseFee || Gwei_1) / Gwei_1 + priFee;
        const suggestedGwei = Number(Math.min(maxPrice * 1.25, maxPrice + 20).toFixed(6));
        this.setMaxGasPrice(suggestedGwei);
      } else {
        this.setMaxGasPrice((gasPrice || Gwei_1) / Gwei_1);
      }

      this.initializing = false;
    });
  }

  protected async estimateGas(args: { from: string; to: string; data: string; value?: string }) {
    runInAction(() => (this.isEstimatingGas = true));

    const { gas, errorMessage } = await estimateGas(this.network.chainId, args);

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  protected refreshEIP1559(chainId: number) {
    getNextBlockBaseFee(chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(chainId), 1000 * (chainId === 1 ? 10 : 5));
    });
  }

  protected async initFeeToken() {
    if (!this.network.feeTokens) return;
    const tokenAddress = await AsyncStorage.getItem(`${this.network.chainId}_feeToken`);
    const token = this.network.feeTokens.find((token) => token.address === tokenAddress) ?? this.network.feeTokens[0];
    const feeToken = new ERC20Token({ ...this.network, ...token, owner: this.account.address, contract: token.address });
    feeToken.getBalance();
    runInAction(() => (this.feeToken = feeToken));
  }
}

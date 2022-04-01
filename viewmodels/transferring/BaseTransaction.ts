import { BigNumber, ethers, providers, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../../common/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import {
  estimateGas,
  eth_call,
  eth_call_return,
  getCode,
  getGasPrice,
  getMaxPriorityFee,
  getNextBlockBaseFee,
  getTransactionCount,
} from '../../common/RPC';

import { Account } from '../account/Account';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Coingecko from '../../common/apis/Coingecko';
import { ERC20Token } from '../../models/ERC20';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import { Wallet } from '../Wallet';
import { getAvatar } from '../../common/ENS';
import { showMessage } from 'react-native-flash-message';
import { startLayoutAnimation } from '../../utils/animations';

export class BaseTransaction {
  private timer?: NodeJS.Timer;

  readonly network: INetwork;
  readonly account: Account;
  readonly wallet: Wallet;
  readonly nativeToken: NativeToken;

  to = '';
  toAddress = '';
  avatar?: string = '';
  isResolvingAddress = false;
  isContractRecipient = false;
  isContractWallet = false;

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
      to: observable,
      toAddress: observable,
      isValidAddress: computed,
      isResolvingAddress: observable,
      isContractRecipient: observable,
      isContractWallet: observable,
      hasZWSP: computed,
      safeTo: computed,

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
      feeTokenSymbol: computed,
      insufficientFee: computed,

      setNonce: action,
      setGasLimit: action,
      setMaxGasPrice: action,
      setPriorityPrice: action,
      setTo: action,
      setToAddress: action,
      setGas: action,
      setFeeToken: action,
    });

    this.nativeToken.getBalance();

    if (initChainData) this.initChainData({ ...args, account: args.account.address });

    if (this.network.eip1559) this.refreshEIP1559(this.network.chainId);
    if (this.network.feeTokens) this.initFeeToken();

    Coingecko.refresh();
  }

  get safeTo() {
    return this.to.replace(/[\u200B|\u200C|\u200D]/g, '[?]');
  }

  get isValidAddress() {
    return utils.isAddress(this.toAddress);
  }

  get isEns() {
    const lower = this.to.toLowerCase();
    return lower.endsWith('.eth') || lower.endsWith('.xyz');
  }

  get hasZWSP() {
    return /[\u200B|\u200C|\u200D]/.test(this.to);
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

  setToAddress(to: string) {
    this.toAddress = to;
    this.isResolvingAddress = false;
    this.checkToAddress();
  }

  private _ensProvider?: providers.WebSocketProvider;

  async setTo(to?: string, avatar?: string) {
    if (to === undefined || to === null) return;

    to = to.trim();
    this.avatar = avatar;

    if (this.to.toLowerCase() === to.toLowerCase()) return;

    this.to = to;
    this.toAddress = '';
    this.txException = '';
    this._ensProvider?.destroy();
    this._ensProvider = undefined;

    if (!to) return;

    if (utils.isAddress(to)) {
      this.setToAddress(utils.getAddress(to));
      return;
    }

    if (this.network.addrPrefix && to.toLowerCase().startsWith(this.network.addrPrefix)) {
      let addr = to.substring(this.network.addrPrefix.length);
      addr = addr.startsWith('0x') ? addr : `0x${addr}`;

      utils.isAddress(addr) ? this.setToAddress(utils.getAddress(addr)) : undefined;
      return;
    }

    if (!to.endsWith('.eth') && !to.endsWith('.xyz')) return;
    this._ensProvider = Networks.MainnetWsProvider;

    this.isResolvingAddress = true;
    const address = (await this._ensProvider.resolveName(to)) || '';

    if (!this._ensProvider) return;
    this._ensProvider?.destroy();

    runInAction(() => this.setToAddress(address));

    if (avatar) return;

    const img = await getAvatar(to, address);
    if (!img?.url) return;

    runInAction(() => (this.avatar = img.url));
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

  async checkToAddress() {
    const code = await getCode(this.network.chainId, this.toAddress);
    if (code === '0x') {
      runInAction(() => {
        this.isContractRecipient = false;
        this.isContractWallet = false;
      });
      return;
    }

    const encodedERC1271Data =
      '0x1626ba7e1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000041659b1bcd331201b0ff8b6ec0e6f12b96056c50807a51d504de2c950e8b79e04e34f5e0ceaf26a0b48aca9fc5431b0e942bb6166fd835d1bd581c8e1284da1dd11b00000000000000000000000000000000000000000000000000000000000000';

    const result = await eth_call_return(this.network.chainId, { to: this.toAddress, data: encodedERC1271Data });

    const errorCode = Number(result?.error?.code);
    const isContractWallet = Boolean(result?.error?.data && Number.isInteger(errorCode) && errorCode !== -32000);

    runInAction(() => {
      this.isContractWallet = isContractWallet;
      this.isContractRecipient = code !== '0x';
    });
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
      startLayoutAnimation();

      this.nextBlockBaseFeeWei = Number(nextBaseFee.toFixed(0));

      this.setNonce(nonce);

      if (eip1559) {
        const priFee = (priorityFee || Gwei_1) / Gwei_1 + (chainId === 1 ? 0.2 : 0.05);
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

  async sendRawTx(args: { tx?: providers.TransactionRequest; readableInfo?: any }, pin?: string) {
    const { tx, readableInfo } = args;

    if (!tx) return { success: false, error: 'No transaction' };

    const { txHex, error } = await this.wallet.signTx({
      accountIndex: this.account.index,
      tx,
      pin,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return { success: false, error };
    }

    this.wallet.sendTx({
      tx,
      txHex,
      readableInfo,
    });

    return { success: true, txHex, tx: utils.parseTransaction(txHex) };
  }
}

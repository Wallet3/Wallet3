import { BigNumber, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../common/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getGasPrice, getMaxPriorityFee, getNextBlockBaseFee, getTransactionCount } from '../common/RPC';

import { INetwork } from '../common/Networks';

export class BaseTransaction {
  private timer?: NodeJS.Timer;

  readonly network: INetwork;

  isEstimatingGas = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = -1;
  txException = '';

  constructor(args: { network: INetwork; account: string }) {
    this.network = args.network;

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

      setNonce: action,
      setGasLimit: action,
      setMaxGasPrice: action,
      setPriorityPrice: action,
      setGas: action,
    });

    this.initChainData(args);

    if (this.network.eip1559) this.refreshEIP1559(this.network.chainId);
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get txFeeWei() {
    return this.network.eip1559
      ? BigNumber.from(this.nextBlockBaseFeeWei)
          .add(BigNumber.from((Number(this.maxPriorityPrice.toFixed(9)) * Gwei_1).toFixed(0)))
          .mul(this.gasLimit)
      : BigNumber.from((this.maxGasPrice * Gwei_1).toFixed(0)).mul(this.gasLimit);
  }

  get txFee() {
    try {
      return Number(utils.formatEther(this.txFeeWei));
    } catch (error) {
      return 0;
    }
  }

  setNonce(nonce: string | number) {
    this.nonce = Number(nonce);
  }

  setGasLimit(limit: string | number) {
    try {
      this.gasLimit = Math.max(Math.min(Number.parseInt(limit as any), 100_000_000), 21000);
    } catch (error) {}
  }

  setMaxGasPrice(price: string | number) {
    try {
      this.maxGasPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
    } catch {}
  }

  setPriorityPrice(price: string | number) {
    try {
      this.maxPriorityPrice = Math.max(Math.min(Number(price), MAX_GWEI_PRICE), 0);
    } catch (error) {}
  }

  async setGas(speed: 'rapid' | 'fast' | 'standard') {
    const wei = (await getGasPrice(this.network.chainId)) || Gwei_1;
    const basePrice = wei / Gwei_1;

    runInAction(() => {
      switch (speed) {
        case 'rapid':
          this.setMaxGasPrice(basePrice + (this.network.eip1559 ? this.maxPriorityPrice : 0) + 10);
          break;
        case 'fast':
          this.setMaxGasPrice(basePrice);
          break;
        case 'standard':
          this.setMaxGasPrice(Math.max(basePrice - 3, 1));
          break;
      }
    });
  }

  dispose() {
    clearTimeout(this.timer as any);
  }

  protected async initChainData({ network, account }: { network: INetwork; account: string }) {
    const { chainId, eip1559 } = network;
    
    const [gasPrice, nextBaseFee, priorityFee, nonce] = await Promise.all([
      getGasPrice(chainId),
      getNextBlockBaseFee(chainId),
      getMaxPriorityFee(chainId),
      getTransactionCount(chainId, account),
    ]);

    runInAction(() => {
      this.nextBlockBaseFeeWei = Number(nextBaseFee.toFixed(0));

      const priFee = (priorityFee || Gwei_1) / Gwei_1 + 0.1;

      this.setNonce(nonce);
      this.setPriorityPrice(priFee);

      if (eip1559) {
        this.setMaxGasPrice((nextBaseFee || Gwei_1) / Gwei_1 + priFee + 3);
      } else {
        this.setMaxGasPrice((gasPrice || Gwei_1) / Gwei_1);
      }
    });
  }

  protected async estimateGas(chainId: number, args: { from: string; to: string; data: string }) {
    runInAction(() => (this.isEstimatingGas = true));

    const { gas, errorMessage } = await estimateGas(chainId, args);

    runInAction(() => {
      this.isEstimatingGas = false;
      this.setGasLimit(gas || 0);
      this.txException = errorMessage || '';
    });
  }

  protected refreshEIP1559(chainId: number) {
    getNextBlockBaseFee(chainId).then((nextBaseFee) => {
      runInAction(() => (this.nextBlockBaseFeeWei = nextBaseFee));
      this.timer = setTimeout(() => this.refreshEIP1559(chainId), 1000 * 10);
    });
  }
}

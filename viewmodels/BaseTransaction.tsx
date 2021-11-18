import { BigNumber, utils } from 'ethers';
import { Gwei_1, MAX_GWEI_PRICE } from '../common/Constants';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { estimateGas, getGasPrice, getMaxPriorityFee, getNextBlockBaseFee, getTransactionCount } from '../common/RPC';

export class BaseTransaction {
  private timer?: NodeJS.Timer;
  private eip1559 = false;

  isEstimatingGas = false;
  gasLimit = 21000;
  nextBlockBaseFeeWei = 0;
  maxGasPrice = 0; // Gwei
  maxPriorityPrice = 0; // Gwei
  nonce = -1;
  txException = '';

  constructor(args: { chainId: number; eip1559?: boolean; account: string }) {
    this.eip1559 = args.eip1559 ?? false;

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
    });

    this.initChainData(args);

    if (this.eip1559) this.refreshEIP1559(args.chainId);
  }

  get nextBlockBaseFee() {
    return this.nextBlockBaseFeeWei / Gwei_1;
  }

  get txFeeWei() {
    return this.eip1559
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

  dispose() {
    clearTimeout(this.timer as any);
  }

  protected async initChainData({ chainId, eip1559, account }: { chainId: number; eip1559?: boolean; account: string }) {
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

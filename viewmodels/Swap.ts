import '@ethersproject/shims';
import { BigNumber, providers, utils } from 'ethers';
import { computed, makeAutoObservable, reaction, runInAction } from 'mobx';

import { IToken } from '../common/tokens';
import { ERC20Token } from '../models/ERC20';
import App from './App';
import Stableswap from './swap/Stableswap';
import Networks from './Networks';
import delay from 'delay';
import TxHub from './hubs/TxHub';
import { showMessage } from 'react-native-flash-message';
import { getProviderByChainId } from '../common/RPC';
import { RawTransactionRequest } from './transferring/RawTransactionRequest';

interface ISwapToken extends IToken {
  allowance?: BigNumber;
}

export class SwapVM {
  from: ISwapToken = this.currentExecutor.fromTokens(this.currentChainId)[0];
  for: ISwapToken = this.currentExecutor.forTokens(this.currentChainId)[1];

  max = BigNumber.from(0);
  fromAmount = '';
  forAmount = '';
  slippage = 0.5;
  fee = 0.05;

  private isApproving = new Map<number, boolean>();
  private isSwapping = new Map<number, boolean>();

  get approving() {
    return this.isApproving.get(this.currentChainId);
  }

  get swapping() {
    return this.isSwapping.get(this.currentChainId);
  }

  get currentExecutor() {
    return Stableswap;
  }

  get currentChainId() {
    return Networks.current.chainId;
  }

  get fromList(): ISwapToken[] {
    return this.currentExecutor.fromTokens(this.currentChainId);
  }

  get forList(): ISwapToken[] {
    return this.currentExecutor.forTokens(this.currentChainId);
  }

  get isValid() {
    try {
      return (
        this.max.gte(utils.parseUnits(this.fromAmount || '0', this.from?.decimals)) &&
        Number(this.fromAmount) > 0 &&
        this.forAmount &&
        this.from &&
        this.for &&
        this.fromList?.length > 0 &&
        this.forList?.length > 0
      );
    } catch (error) {
      return false;
    }
  }

  get accountAddress() {
    return App.currentAccount?.address!;
  }

  get approved() {
    try {
      return this.from.allowance?.gte(utils.parseUnits(this.fromAmount || '0', this.from.decimals || 0));
    } catch (error) {
      return false;
    }
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.currentChainId,
      () => this.init()
    );

    reaction(
      () => App.currentAccount,
      () => this.init()
    );
  }

  init() {
    this.clean();
    this.selectFrom(this.fromList[0]);
    this.selectFor(this.forList[1]);
  }

  clean() {
    this.from = this.currentExecutor.fromTokens(this.currentChainId)[0];
    this.for = this.currentExecutor.forTokens(this.currentChainId)[1];
    this.fromAmount = '';
    this.forAmount = '';
  }

  selectFrom(token?: ISwapToken, check = true) {
    if (this.for?.address === token?.address && check) {
      this.interchange();
      return;
    }

    if (!token) {
      this.max = BigNumber.from(0);
      return;
    }

    this.fromAmount = '';
    this.from = token;

    const erc20 = new ERC20Token({
      contract: token.address,
      owner: this.accountAddress,
      chainId: Networks.current.chainId,
    });

    erc20.getBalance().then((balance) => {
      runInAction(() => (this.max = balance));
    });

    erc20.allowance(this.accountAddress, this.currentExecutor.getContractAddress(this.currentChainId)).then((allowance) => {
      runInAction(() => (this.from.allowance = allowance));
    });
  }

  selectFor(token: ISwapToken, check = true) {
    if (this.from?.address === token?.address && check) {
      this.interchange();
      return;
    }

    this.forAmount = '';

    this.for = token;
    this.setFromAmount(this.fromAmount);
  }

  interchange() {
    this.max = BigNumber.from(0);
    this.fromAmount = this.forAmount = '';

    const forToken = this.for;
    const fromToken = this.from;

    this.selectFrom(forToken, false);
    this.selectFor(fromToken, false);
  }

  setSlippage(value: number) {
    this.slippage = value;
  }

  async setFromAmount(value: string) {
    if (!this.from || !this.for) return;

    this.fromAmount = value;
    if (value) {
      const amount = utils.parseUnits(value, this.from.decimals);

      const forAmount = await this.currentExecutor.getAmountOut(this.currentChainId, this.from, this.for, amount);
      runInAction(() => (this.forAmount = utils.formatUnits(forAmount!, this.for?.decimals)));
    } else {
      this.forAmount = '';
    }
  }

  get approveTx() {
    const token = this.from;
    const erc20 = new ERC20Token({
      contract: token.address,
      owner: this.accountAddress!,
      chainId: Networks.current.chainId,
    });
    const data = erc20.encodeApproveData(
      this.currentExecutor.getContractAddress(this.currentChainId),
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    );

    const rawTR = new RawTransactionRequest({
      param: {
        from: this.accountAddress,
        to: token.address,
        value: BigNumber.from(0).toString(),
        gas: BigNumber.from(150_000).toString(),
        data,
      },
      network: Networks.current,
      account: App.currentAccount!,
    });
    return rawTR;
  }

  async approve(pin?: string) {
    const rawTR = this.approveTx;
    const { wallet, accountIndex } = App.findWallet(this.accountAddress)!;

    const { txHex, error } = await wallet.signTx({
      accountIndex,
      tx: rawTR.txRequest!,
      pin,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return false;
    }

    await wallet.sendTx({
      tx: rawTR.txRequest!,
      txHex,
      readableInfo: {
        type: 'dapp-interaction',
        symbol: rawTR.erc20?.symbol,
        amount: Number(rawTR.tokenAmount).toString(),
        decodedFunc: rawTR.decodedFunc?.fullFunc,
      },
    });

    const allowance = await rawTR.erc20!.allowance(
      this.accountAddress,
      this.currentExecutor.getContractAddress(this.currentChainId)
    );

    runInAction(() => {
      this.from.allowance = allowance;
    });

    return true;
  }

  get swapTx() {
    const amountIn = utils.parseUnits(this.fromAmount || '0', this.from!.decimals || 0);
    const minOut = utils
      .parseUnits(this.forAmount || '0', this.for!.decimals || 0)
      .mul(this.slippage * 10)
      .div(1000);

    const data = this.currentExecutor.encodeSwapData(this.currentChainId, this.from, this.for, amountIn, minOut)!;

    const rawTR = new RawTransactionRequest({
      param: {
        from: this.accountAddress,
        to: this.currentExecutor.getContractAddress(this.currentChainId),
        value: BigNumber.from(0).toString(),
        data,
        gas: '900000',
      },
      network: Networks.current,
      account: App.currentAccount!,
    });
    return rawTR;
  }

  async swap(pin?: string) {
    const rawTR = this.swapTx;

    const { wallet, accountIndex } = App.findWallet(this.accountAddress)!;

    const { txHex, error } = await wallet.signTx({
      accountIndex,
      tx: rawTR.txRequest!,
      pin,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return false;
    }

    await wallet.sendTx({
      tx: rawTR.txRequest!,
      txHex,
      readableInfo: {
        type: 'dapp-interaction',
        decodedFunc: rawTR.decodedFunc?.fullFunc,
      },
    });

    runInAction(() => {
      this.selectFrom(this.from);
      this.selectFor(this.for);
    });

    return true;
  }
}

export default new SwapVM();

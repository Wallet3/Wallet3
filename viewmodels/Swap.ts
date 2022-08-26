import '@ethersproject/shims';
import { BigNumber, providers, utils } from 'ethers';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { IToken } from '../common/tokens';
import { ERC20Token } from '../models/ERC20';
import App from './App';
import Stableswap from './swap/Stableswap';
import Networks from './Networks';
import delay from 'delay';
import TxHub from './hubs/TxHub';
import { showMessage } from 'react-native-flash-message';

interface ISwapToken extends IToken {
  allowance?: BigNumber;
}

export class SwapVM {
  from?: ISwapToken;
  for?: ISwapToken;

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
    return this.currentExecutor.fromTokens(this.currentChainId).filter((t) => t.address !== this.from?.address);
  }

  get forList(): ISwapToken[] {
    return this.currentExecutor.forTokens(this.currentChainId).filter((t) => t.address !== this.for?.address);
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

  get account() {
    return App.currentAccount?.address!;
  }

  get approved() {
    try {
      return this.from?.allowance?.gte(utils.parseUnits(this.fromAmount || '0', this.from?.decimals || 0));
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
    this.forAmount = '';
    this.fromAmount = '';
    this.selectFrom(this.fromList[0]);
    this.selectFor(this.forList[1]);
  }

  clean() {
    this.from = undefined;
    this.for = undefined;
    this.fromAmount = '';
    this.forAmount = '';
  }

  selectFrom(token?: ISwapToken) {
    if (!token) {
      this.max = BigNumber.from(0);
      return;
    }

    this.fromAmount = '';
    this.from = token;

    const erc20 = new ERC20Token({
      contract: token.address,
      owner: this.account!,
      chainId: Networks.current.chainId,
    });

    erc20.getBalance().then((balance) => {
      runInAction(() => (this.max = balance));
    });

    console.log(this.account!, this.currentExecutor.getContractAddress(this.currentChainId));

    erc20
      .allowance(this.account!, this.currentExecutor.getContractAddress(this.currentChainId))
      .then((allowance) => {
        runInAction(() => (this.from!.allowance = allowance));
      })
      .catch(console.error);
  }

  selectFor(token?: ISwapToken) {
    if (!token) return;
    this.forAmount = '';
    this.for = token;
    this.setFromAmount(this.fromAmount);
  }

  interchange() {
    this.max = BigNumber.from(0);
    this.fromAmount = this.forAmount = '';

    const forToken = this.for;
    const fromToken = this.from;

    this.selectFrom(forToken);
    this.selectFor(fromToken);
  }

  setSlippage(value: number) {
    this.slippage = value;
  }

  async setFromAmount(value: string) {
    if (!this.from || !this.for) return;

    this.fromAmount = value;
    const amount = utils.parseUnits(value, this.from.decimals);

    const forAmount = await this.currentExecutor.getAmountOut(this.currentChainId, this.from, this.for, amount);
    runInAction(() => (this.forAmount = utils.formatUnits(forAmount!, this.for?.decimals)));
  }

  private async awaitTx({ provider, nonce, chainId }: { chainId: number; nonce: number; provider: providers.BaseProvider }) {
    await delay(1000);

    const tx = TxHub.pendingTxs.find((tx) => tx.from === this.account && tx.nonce === nonce);

    while (tx) {
      await delay(3000);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt) break;
    }

    runInAction(() => {
      this.isApproving.set(chainId, false);
      this.isSwapping.set(chainId, false);
    });

    return tx ? true : false;
  }

  async approve() {
    const provider = Networks.current;
    const chainId = this.currentChainId;
    const token = this.from!;

    runInAction(() => this.isApproving.set(chainId, true));

    const erc20 = new ERC20Token({
      contract: token.address,
      owner: this.account!,
      chainId: Networks.current.chainId,
    });
    const data = erc20.encodeApproveData(
      this.currentExecutor.getContractAddress(this.currentChainId),
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    );

    const { wallet, accountIndex } = App.findWallet(this.account)!;

    const tx: providers.TransactionRequest = {
      chainId,
      from: this.account,
      to: this.from!.address,
      value: '0',
      data,
    };

    if (!tx) return { success: false, error: 'No transaction' };

    const { txHex, error } = await wallet.signTx({
      accountIndex,
      tx,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return { success: false, error };
    }

    await wallet.sendTx({
      tx,
      txHex,
      readableInfo: {
        type: 'transfer',
      },
    });

    const allowance = await erc20.allowance(this.account, this.currentExecutor.getContractAddress(this.currentChainId));

    runInAction(() => {
      token.allowance = allowance;
    });
  }

  async swap() {
    const provider = Networks.current;
    const chainId = this.currentChainId;

    runInAction(() => this.isSwapping.set(chainId, true));

    const amountIn = utils.parseUnits(this.fromAmount || '0', this.from!.decimals || 0);
    const minOut = utils
      .parseUnits(this.forAmount || '0', this.for!.decimals || 0)
      .mul(this.slippage * 10)
      .div(1000);

    const data = this.currentExecutor.encodeSwapData(chainId, this.from!, this.for!, amountIn, minOut);

    const { wallet, accountIndex } = App.findWallet(this.account)!;

    const tx: providers.TransactionRequest = {
      chainId,
      from: this.account,
      to: this.currentExecutor.getContractAddress(chainId),
      value: '0',
      data,
    };

    if (!tx) return { success: false, error: 'No transaction' };

    const { txHex, error } = await wallet.signTx({
      accountIndex,
      tx,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return { success: false, error };
    }

    await wallet.sendTx({
      tx,
      txHex,
      readableInfo: {
        type: 'transfer',
      },
    });

    runInAction(() => {
      this.selectFrom(this.from);
      this.selectFor(this.for);
    });
  }
}

export default new SwapVM();

import { ETH, IToken } from '../../../common/tokens';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { ethers, providers, utils } from 'ethers';

import { Account } from '../../account/Account';
import App from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurveRouterABI from '../../../abis/CurveRouter.json';
import { ERC20Token } from '../../../models/ERC20';
import { INetwork } from '../../../common/Networks';
import { IRouteStep } from '@curvefi/api/lib/interfaces';
import LINQ from 'linq';
import MessageKeys from '../../../common/MessageKeys';
import { NativeToken } from '../../../models/NativeToken';
import Networks from '../../Networks';
import { ReadableInfo } from '../../../models/Transaction';
import { SupportedChains } from './CurveSupportedChains';
import TxHub from '../../hubs/TxHub';
import curve from '@curvefi/api';
import { getRPCUrls } from '../../../common/RPC';

const Keys = {
  userSelectedNetwork: 'exchange-userSelectedNetwork',
  userSelectedAccount: 'exchange-userSelectedAccount',

  userSelectedFromToken: (chainId: number) => `${chainId}-exchange-from`,
  userSelectedToToken: (chainId: number) => `${chainId}-exchange-to`,
  userSlippage: (chainId: number) => `${chainId}-exchange-slippage`,
  userCustomizedTokens: (chainId: number) => `${chainId}-exchange-tokens`,
};

const app = { name: 'Curve Exchange', icon: 'https://curve.fi/apple-touch-icon.png', verified: true };

export class CurveExchange {
  private calcExchangeRateTimer?: NodeJS.Timer;
  private watchPendingTxTimer?: NodeJS.Timer;
  private curveNetwork?: Promise<void>;
  swapRoute: IRouteStep[] | null = null;

  networks = SupportedChains.map(({ chainId }) => Networks.find(chainId)!);
  userSelectedNetwork = Networks.Ethereum;
  account = App.currentAccount!;

  tokens: (NativeToken | ERC20Token)[] = [];
  swapFrom: (NativeToken | ERC20Token) | null = null;
  swapTo: (NativeToken | ERC20Token) | null = null;
  swapFromAmount = '';
  swapToAmount: string | null = null;
  calculating = false;
  checkingApproval = false;
  exchangeRate = 0;
  needApproval = true;
  slippage = 0.5;

  pendingTxs: string[] = [];

  protected get chain() {
    return SupportedChains.find(({ chainId }) => this.userSelectedNetwork.chainId === chainId)!;
  }

  get isValidFromAmount() {
    try {
      const amount = utils.parseUnits(this.swapFromAmount, this.swapFrom?.decimals || 18);
      return amount.gt(0) && amount.lte(this.swapFrom?.balance!);
    } catch (error) {
      return false;
    }
  }

  get isValidOutputAmount() {
    try {
      return utils.parseUnits(this.swapToAmount || '0', this.swapTo?.decimals).gt(0);
    } catch (error) {
      return false;
    }
  }

  get hasRoutes() {
    return (this.swapRoute?.length || 0) > 0;
  }

  get isPending() {
    return TxHub.pendingTxs
      .filter((t) => this.pendingTxs.includes(t.hash))
      .some((tx) => tx.from === this.account.address && tx.chainId === this.userSelectedNetwork.chainId);
  }

  constructor() {
    makeObservable(this, {
      userSelectedNetwork: observable,
      networks: observable,
      tokens: observable,
      swapFrom: observable,
      swapTo: observable,
      account: observable,
      swapFromAmount: observable,
      swapToAmount: observable,
      exchangeRate: observable,
      calculating: observable,
      checkingApproval: observable,
      needApproval: observable,
      slippage: observable,
      pendingTxs: observable,
      swapRoute: observable,

      hasRoutes: computed,
      isPending: computed,

      switchNetwork: action,
      switchAccount: action,
      switchSwapFrom: action,
      switchSwapTo: action,
      setSwapAmount: action,
      setSlippage: action,
      enqueueTx: action,
      addToken: action,
    });
  }

  async init() {
    const chainId = Number((await AsyncStorage.getItem(Keys.userSelectedNetwork)) || 1);
    const slippage = Number(await AsyncStorage.getItem(Keys.userSlippage(chainId))) || 0.5;
    const defaultAccount =
      App.findAccount((await AsyncStorage.getItem(Keys.userSelectedAccount)) as string) || App.currentAccount;

    runInAction(() => {
      this.switchAccount(defaultAccount!);
      this.switchNetwork(Networks.find(chainId)!);
      this.slippage = slippage;
    });
  }

  async switchAccount(account: Account | string) {
    this.account =
      typeof account === 'string' ? (App.findAccount(account) as Account) : (account as Account) || App.currentAccount;

    AsyncStorage.setItem(Keys.userSelectedAccount, this.account.address);

    this.tokens.forEach((t) => {
      t.setOwner(this.account.address);
      t.getBalance();
    });
  }

  async switchNetwork(network: INetwork) {
    this.userSelectedNetwork = network;

    AsyncStorage.setItem(Keys.userSelectedNetwork, `${network.chainId}`);
    this.curveNetwork = curve.init('JsonRpc', { url: getRPCUrls(network.chainId)[0] }, { chainId: network.chainId });

    const saved = (
      JSON.parse((await AsyncStorage.getItem(Keys.userCustomizedTokens(network.chainId))) || '[]') as IToken[]
    ).filter((t) => t.address);

    const nativeToken = new NativeToken({ owner: this.account.address, chainId: network.chainId, symbol: network.symbol });

    const userTokens = LINQ.from([...saved, ...this.chain.defaultTokens])
      .select((t) => {
        const erc20 = new ERC20Token({
          chainId: network.chainId,
          owner: this.account.address,
          contract: t.address,
          symbol: t.symbol,
          decimals: t.decimals,
        });

        erc20.getBalance();
        return erc20;
      })
      .distinct((t) => t.address)
      .toArray();

    const tokens = [1, 42161].includes(network.chainId) ? [nativeToken, ...userTokens] : userTokens;

    const swapFromAddress = await AsyncStorage.getItem(Keys.userSelectedFromToken(network.chainId));
    const fromToken = tokens.find((t) => t.address === swapFromAddress) || tokens[0];

    const swapToAddress = await AsyncStorage.getItem(Keys.userSelectedToToken(network.chainId));
    const toToken = tokens.find((t) => t.address === swapToAddress) || tokens.find((t) => t.address !== fromToken.address)!;

    runInAction(() => {
      this.tokens = tokens;
      this.swapRoute = null;

      this.switchSwapFrom(fromToken, false);
      this.switchSwapTo(toToken, false);
    });
  }

  switchSwapFrom(token: ERC20Token | NativeToken, checkToken = true) {
    if (!token) return;
    if (checkToken && token.address === this.swapTo?.address) {
      this.switchSwapTo(this.swapFrom!, false);
    }

    this.swapFrom = token;
    this.swapFrom.getBalance();
    this.exchangeRate = 0;
    this.checkingApproval = true;

    if (token.address) {
      this.checkApproval(true);
    } else {
      this.checkingApproval = false;
      this.needApproval = false;
    }

    this.setSwapAmount(this.swapFromAmount);
    AsyncStorage.setItem(Keys.userSelectedFromToken(this.userSelectedNetwork.chainId), token.address);
  }

  switchSwapTo(token: ERC20Token | NativeToken, checkToken = true) {
    if (!token) return;
    if (checkToken && token.address === this.swapFrom?.address) {
      this.switchSwapFrom(this.swapTo!, false);
    }

    this.swapTo = token;
    this.exchangeRate = 0;

    this.setSwapAmount(this.swapFromAmount);
    AsyncStorage.setItem(Keys.userSelectedToToken(this.userSelectedNetwork.chainId), token.address);
  }

  private clearSwapAmount() {
    runInAction(() => {
      this.swapFromAmount = '';
      this.swapToAmount = '';
      this.exchangeRate = 0;
    });
  }

  async setSwapAmount(amount: string) {
    clearTimeout(this.calcExchangeRateTimer);
    this.swapFromAmount = amount;
    this.exchangeRate = 0;

    if (!amount) {
      this.swapToAmount = '';
      return;
    }

    if (!Number(amount)) return;

    this.calculating = true;
    this.swapRoute = null;

    if (this.curveNetwork) {
      await this.curveNetwork;
      this.curveNetwork = undefined;
    }

    this.calcExchangeRateTimer = setTimeout(() => this.calcExchangeRate(), 500);
  }

  setSlippage(amount: number) {
    amount = Math.min(Math.max(0, amount), 99) || 0;
    this.slippage = amount;

    AsyncStorage.setItem(Keys.userSlippage(this.userSelectedNetwork.chainId), `${amount}`);
  }

  async calcExchangeRate() {
    runInAction(() => (this.calculating = true));

    this.checkApproval();

    try {
      const { route, output } = await curve.router.getBestRouteAndOutput(
        this.swapFrom!.address || ETH.address,
        this.swapTo!.address || ETH.address,
        this.swapFromAmount
      );

      runInAction(() => {
        this.swapRoute = route;
        this.swapToAmount = output;
        this.exchangeRate = Number(output) / Number(this.swapFromAmount);
      });
    } catch (e) {
      runInAction(() => {
        this.swapToAmount = '';
        this.exchangeRate = 0;
      });
    }

    runInAction(() => (this.calculating = false));

    if (!Number(this.swapFromAmount)) return;
    this.calcExchangeRateTimer = setTimeout(() => this.calcExchangeRate(), 45 * 10000);
  }

  private async checkApproval(force = false) {
    const approved = await (this.swapFrom as ERC20Token)?.allowance?.(this.account.address, this.chain.router, force);
    if (!approved) return;

    runInAction(() => {
      this.needApproval = approved.lt(utils.parseUnits(this.swapFromAmount || '0', this.swapFrom?.decimals));
      this.checkingApproval = false;
    });
  }

  approve() {
    let data = '0x';

    try {
      data = (this.swapFrom as ERC20Token).encodeApproveData(
        this.chain.router,
        utils.parseUnits(this.swapFromAmount, this.swapFrom!.decimals)
      );
    } catch (error) {
      return;
    }

    const approve = async (opts: { pin: string; tx: providers.TransactionRequest; readableInfo: ReadableInfo }) => {
      const { txHash } = await App.sendTxFromAccount(this.account.address, opts);

      if (txHash) {
        runInAction(() => {
          this.enqueueTx(txHash);
        });
      }

      return txHash ? true : false;
    };

    const reject = () => {};

    PubSub.publish(MessageKeys.openInpageDAppSendTransaction, {
      approve,
      reject,
      param: { from: this.account.address, to: this.swapFrom!.address, data },
      chainId: this.userSelectedNetwork.chainId,
      account: this.account.address,
      app,
    });
  }

  swap() {
    if (!this.swapRoute || this.swapRoute.length === 0 || !this.isValidFromAmount) return;

    let route = [this.swapFrom!.address || ETH.address];
    let swapParams: any[] = [];
    let factorySwapAddrs: string[] = [];

    for (let routeStep of this.swapRoute) {
      route.push(routeStep.poolAddress, routeStep.outputCoinAddress);
      swapParams.push([routeStep.i, routeStep.j, routeStep.swapType]);
      factorySwapAddrs.push(routeStep.swapAddress);
    }

    route = route.concat(new Array(9 - route.length).fill(ethers.constants.AddressZero));
    swapParams = swapParams.concat(new Array(4 - swapParams.length).fill([0, 0, 0]));
    factorySwapAddrs = factorySwapAddrs.concat(new Array(4 - factorySwapAddrs.length).fill(ethers.constants.AddressZero));

    if (route.length > 9) return;

    const curve = new ethers.Contract(this.chain.router, CurveRouterABI);
    const data = curve.interface.encodeFunctionData('exchange_multiple(address[9],uint256[3][4],uint256,uint256,address[4])', [
      route,
      swapParams,
      utils.parseUnits(this.swapFromAmount, this.swapFrom?.decimals),
      utils
        .parseUnits(this.swapToAmount!, this.swapTo?.decimals)
        .mul(Number.parseInt((10000 - Number((this.slippage || 0.5).toFixed(2)) * 100) as any))
        .div(10000),
      factorySwapAddrs,
    ]);

    const approve = async (opts: { pin: string; tx: providers.TransactionRequest; readableInfo: ReadableInfo }) => {
      const { txHash } = await App.sendTxFromAccount(this.account.address, opts);
      const result = txHash ? true : false;

      if (result) {
        runInAction(() => {
          this.enqueueTx(txHash!);
          this.clearSwapAmount();
        });
      }

      return result;
    };

    const reject = () => {};

    PubSub.publish(MessageKeys.openInpageDAppSendTransaction, {
      approve,
      reject,
      param: {
        from: this.account.address,
        to: this.chain.router,
        data,
        value: this.swapFrom?.address ? '0x0' : utils.parseEther(this.swapFromAmount).toHexString(),
      },
      chainId: this.userSelectedNetwork.chainId,
      account: this.account.address,
      app,
    });
  }

  enqueueTx(hash: string) {
    this.pendingTxs.push(hash);
    clearTimeout(this.watchPendingTxTimer);
    this.watchPendingTxTimer = setTimeout(() => this.watchPendingTxs(), 1000);
  }

  private watchPendingTxs() {
    const pendingTxs = this.pendingTxs.filter((tx) => TxHub.pendingTxs.find((t) => t.hash === tx));

    if (pendingTxs.length < this.pendingTxs.length) {
      this.checkApproval(true);
      this.swapFrom?.getBalance();
      this.swapTo?.getBalance();
    }

    runInAction(() => (this.pendingTxs = pendingTxs));

    if (pendingTxs.length === 0) return;
    this.watchPendingTxTimer = setTimeout(() => this.watchPendingTxs(), 1000);
  }

  addToken(token: ERC20Token) {
    if (token.chainId !== this.userSelectedNetwork.chainId) return;
    if (this.tokens.find((t) => t.address === token.address)) return;

    token.setOwner(this.account.address);
    token.getBalance();
    this.tokens.push(token);

    const data = JSON.stringify(
      this.tokens
        .filter((t) => t.address)
        .map((t) => {
          return { address: t.address, decimals: t.decimals, symbol: t.symbol };
        })
    );

    AsyncStorage.setItem(Keys.userCustomizedTokens(this.userSelectedNetwork.chainId), data);
  }
}

export default new CurveExchange();

import {
  AVAX_DAI_e,
  AVAX_USDC,
  AVAX_USDC_e,
  AVAX_USDt,
  AVAX_WETH_e,
  AVAX_YUSD,
  CRV,
  CVX,
  DAI,
  ETH,
  FRAX,
  IToken,
  MATIC_DAI,
  MATIC_USDC,
  MATIC_USDT,
  MIM,
  STG,
  USDC,
  USDT,
  WBTC,
  YFI,
  renBTC,
  sETH,
  sUSD,
  stETH,
  xDAI_USDC,
  xDAI_USDT,
} from '../../common/tokens';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { providers, utils } from 'ethers';

import { Account } from '../account/Account';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../../models/ERC20';
import { INetwork } from '../../common/Networks';
import MessageKeys from '../../common/MessageKeys';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import { ReadableInfo } from '../../models/Transaction';
import curve from '@curvefi/api';
import { getRPCUrls } from '../../common/RPC';

const SupportedChains: { [key: number]: { router: string; defaultTokens: IToken[] } } = {
  1: {
    router: '0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7',
    defaultTokens: [DAI, USDC, USDT, sUSD, CRV, CVX, sETH, stETH, renBTC, WBTC, MIM, FRAX, YFI, STG],
  },

  137: {
    router: '0xF52e46bEE287aAef56Fb2F8af961d9f1406cF476',
    defaultTokens: [MATIC_DAI, MATIC_USDC, MATIC_USDT],
  },

  100: {
    router: '0xcF897d9C8F9174F08f30084220683948B105D1B1',
    defaultTokens: [xDAI_USDC, xDAI_USDT],
  },

  43114: {
    router: '0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778',
    defaultTokens: [AVAX_WETH_e, AVAX_USDC, AVAX_USDt, AVAX_YUSD, AVAX_DAI_e, AVAX_USDC_e],
  },
};

const Keys = {
  userSelectedNetwork: 'exchange-userSelectedNetwork',
  userSelectedAccount: 'exchange-userSelectedAccount',
  userCustomizedTokens: (chainId: number) => `${chainId}-exchange-userTokens`,
  userSelectedFromToken: (chainId: number) => `${chainId}-exchange-from`,
  userSelectedToToken: (chainId: number) => `${chainId}-exchange-to`,
};

export class CurveExchange {
  private calcExchangeRateTimer?: NodeJS.Timer;

  networks = Object.getOwnPropertyNames(SupportedChains).map((id) => Networks.find(id)!);
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

  protected get chain() {
    return SupportedChains[this.userSelectedNetwork.chainId];
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

      switchNetwork: action,
      switchAccount: action,
      switchSwapFrom: action,
      switchSwapTo: action,
      setSwapAmount: action,
    });
  }

  async init() {
    const chainId = Number((await AsyncStorage.getItem(Keys.userSelectedNetwork)) || 1);
    const defaultAccount =
      App.findAccount((await AsyncStorage.getItem(Keys.userSelectedAccount)) as string) || App.currentAccount;

    runInAction(() => {
      this.switchNetwork(Networks.find(chainId)!);
      this.switchAccount(defaultAccount!);
    });
  }

  async switchAccount(account: Account) {
    this.account = account;
    AsyncStorage.setItem(Keys.userSelectedAccount, account.address);
    this.tokens.forEach((t) => t.setOwner(account.address));
  }

  async switchNetwork(network: INetwork) {
    this.userSelectedNetwork = network;

    AsyncStorage.setItem(Keys.userSelectedNetwork, `${network.chainId}`);
    curve.init('JsonRpc', { url: getRPCUrls(network.chainId)[0] }, { chainId: network.chainId });

    const saved: IToken[] = JSON.parse((await AsyncStorage.getItem(Keys.userCustomizedTokens(network.chainId))) || '[]');
    const nativeToken = new NativeToken({ owner: this.account.address, chainId: network.chainId, symbol: network.symbol });
    const userTokens = (saved.length > 0 ? saved : this.chain.defaultTokens).map(
      (t) =>
        new ERC20Token({
          owner: this.account.address,
          contract: t.address,
          symbol: t.symbol,
          chainId: network.chainId,
          decimals: t.decimals,
        })
    );

    const tokens = network.chainId === 1 ? [nativeToken, ...userTokens] : userTokens;

    const swapFromAddress = await AsyncStorage.getItem(Keys.userSelectedFromToken(network.chainId));
    const swapToAddress = await AsyncStorage.getItem(Keys.userSelectedToToken(network.chainId));

    runInAction(() => {
      this.tokens = tokens;

      this.switchSwapFrom(tokens.find((t) => t.address === swapFromAddress) || tokens[0], false);
      this.switchSwapTo(tokens.find((t) => t.address === swapToAddress) || tokens[1], false);

      this.swapFrom?.getBalance();
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
      (token as ERC20Token).allowance(this.account.address, this.chain.router).then(() => {
        runInAction(() => (this.checkingApproval = false));
      });
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

  setSwapAmount(amount: string) {
    if (!Number(amount)) {
      this.swapFromAmount = '';
      this.swapToAmount = '';
      this.exchangeRate = 0;
      return;
    }

    this.swapFromAmount = amount;
    this.exchangeRate = 0;
    clearTimeout(this.calcExchangeRateTimer);

    if (!amount) {
      this.swapToAmount = '';
      return;
    }

    this.calculating = true;
    this.calcExchangeRateTimer = setTimeout(() => this.calcExchangeRate(), 500);
  }

  async calcExchangeRate() {
    runInAction(() => (this.calculating = true));

    if (this.swapFrom?.address) {
      const approved = await (this.swapFrom as ERC20Token)?.allowance(this.account.address, this.chain.router);
      runInAction(() => {
        this.needApproval = approved.lt(this.swapFromAmount);
        this.checkingApproval = false;
      });
    }

    try {
      const { route, output } = await curve.router.getBestRouteAndOutput(
        this.swapFrom!.address || ETH.address,
        this.swapTo!.address || ETH.address,
        this.swapFromAmount
      );

      runInAction(() => {
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

    const approve = (opts: { pin: string; tx: providers.TransactionRequest; readableInfo: ReadableInfo }) => {
      App.sendTxFromAccount(this.account.address, opts);
    };

    const reject = () => {};

    PubSub.publish(MessageKeys.openInpageDAppSendTransaction, {
      approve,
      reject,
      param: { from: this.account.address, to: this.swapFrom!.address, data },
      chainId: this.userSelectedNetwork.chainId,
      account: this.account.address,
      app: { name: 'Wallet 3 Swap', icon: 'https://wallet3.io/favicon.ico', verified: true },
    });
  }

  swap() {}
}

export default new CurveExchange();

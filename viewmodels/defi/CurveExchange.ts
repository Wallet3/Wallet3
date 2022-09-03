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

import { Account } from '../account/Account';
import App from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERC20Token } from '../../models/ERC20';
import { INetwork } from '../../common/Networks';
import { NativeToken } from '../../models/NativeToken';
import Networks from '../Networks';
import curve from '@curvefi/api';
import { getRPCUrls } from '../../common/RPC';

const SupportedChains: { [key: number]: { router: string; defaultTokens: IToken[] } } = {
  1: {
    router: '0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7',
    defaultTokens: [DAI, USDC, USDT, sUSD, CRV, CVX, sETH, stETH, renBTC, WBTC, MIM, FRAX, YFI, STG],
  },

  100: {
    router: '',
    defaultTokens: [xDAI_USDC, xDAI_USDT],
  },

  137: {
    router: '',
    defaultTokens: [MATIC_DAI, MATIC_USDC, MATIC_USDT],
  },

  43114: {
    router: '',
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
  networks = Object.getOwnPropertyNames(SupportedChains).map((id) => Networks.find(id)!);
  userSelectedNetwork = Networks.Ethereum;
  account = App.currentAccount!;

  tokens: (NativeToken | ERC20Token)[] = [];
  swapFrom: (NativeToken | ERC20Token) | null = null;
  swapTo: (NativeToken | ERC20Token) | null = null;

  constructor() {
    makeObservable(this, {
      userSelectedNetwork: observable,
      networks: observable,
      tokens: observable,
      swapFrom: observable,
      swapTo: observable,
      account: observable,
      switchNetwork: action,
      switchAccount: action,
      switchSwapFrom: action,
      switchSwapTo: action,
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
    const userTokens = (saved.length > 0 ? saved : SupportedChains[network.chainId].defaultTokens).map(
      (t) => new ERC20Token({ owner: this.account.address, contract: t.address, symbol: t.symbol, chainId: network.chainId })
    );

    const tokens = network.chainId === 1 ? [nativeToken, ...userTokens] : userTokens;

    const swapFromAddress = await AsyncStorage.getItem(Keys.userSelectedFromToken(network.chainId));
    const swapToAddress = await AsyncStorage.getItem(Keys.userSelectedToToken(network.chainId));

    runInAction(() => {
      this.tokens = tokens;

      this.swapFrom = tokens.find((t) => t.address === swapFromAddress) || tokens[0];
      this.swapTo = tokens.find((t) => t.address === swapToAddress) || tokens[1];

      this.swapFrom.getBalance();
    });
  }

  switchSwapFrom(token: ERC20Token | NativeToken) {
    this.swapFrom = token;
    AsyncStorage.setItem(Keys.userSelectedFromToken(this.userSelectedNetwork.chainId), token.address);
  }

  switchSwapTo(token: ERC20Token | NativeToken) {
    this.swapTo = token;
    AsyncStorage.setItem(Keys.userSelectedToToken(this.userSelectedNetwork.chainId), token.address);
  }

  calcExchangeRate() {
    // curve.init('JsonRpc', { url: getRPCUrls(1)[0] }, { chainId: 1 }).then(async () => {
    //   const r = await curve.router.getBestRouteAndOutput(
    //     '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    //     '0xD533a949740bb3306d119CC777fa900bA034cd52',
    //     '1000'
    //   );
    //   console.log(r);
    //   await curve.init('JsonRpc', { url: getRPCUrls(137)[0] }, { chainId: 137 });
    //   console.log(
    //     await curve.router.getBestRouteAndOutput(
    //       '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    //       '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    //       '2'
    //     )
    //   );
    // });
  }
}

export default new CurveExchange();

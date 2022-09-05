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
} from '../../../common/tokens';

export const SupportedChains: { [key: number]: { router: string; defaultTokens: IToken[] } } = {
  1: {
    router: '0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7',
    defaultTokens: [DAI, USDC, USDT, sUSD, CRV, CVX, sETH, stETH, renBTC, WBTC, MIM, FRAX],
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

import {
  ARBI_USDC,
  ARBI_USDT,
  ARBI_WBTC,
  ARBI_renBTC,
  AVAX_DAI_e,
  AVAX_USDC,
  AVAX_USDC_e,
  AVAX_USDt,
  AVAX_WETH_e,
  AVAX_YUSD,
  CRV,
  CVX,
  FRAX,
  FTM_DAI,
  FTM_ETH,
  FTM_USDC,
  FTM_WBTC,
  HARMONY_DAI,
  HARMONY_USDC,
  HARMONY_USDT,
  IToken,
  MATIC_DAI,
  MATIC_USDC,
  MATIC_USDT,
  MATIC_WBTC,
  MATIC_WETH,
  MIM,
  OP_DAI,
  OP_USDC,
  OP_USDT,
  WBTC,
  renBTC,
  sETH,
  sUSD,
  stETH,
  wxDAI,
  xDAI_USDC,
  xDAI_USDT,
} from '../../../common/tokens';

export const SupportedChains: { chainId: number; router: string; defaultTokens: IToken[] }[] = [
  {
    chainId: 1,
    router: '0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7',
    defaultTokens: [HARMONY_DAI, HARMONY_USDC, HARMONY_USDT, sUSD, CRV, CVX, sETH, stETH, renBTC, WBTC, MIM, FRAX],
  },

  {
    chainId: 10,
    router: '0x89287c32c2CAC1C76227F6d300B2DBbab6b75C08',
    defaultTokens: [OP_USDC, OP_DAI, OP_USDT],
  },

  {
    chainId: 42161,
    router: '0xd78FC1F568411Aa87a8D7C4CDe638cde6E597a46',
    defaultTokens: [ARBI_USDC, ARBI_USDT, ARBI_renBTC, ARBI_WBTC],
  },

  {
    chainId: 137,
    router: '0xF52e46bEE287aAef56Fb2F8af961d9f1406cF476',
    defaultTokens: [MATIC_WETH, MATIC_DAI, MATIC_USDC, MATIC_USDT, MATIC_WBTC],
  },

  { chainId: 100, router: '0xcF897d9C8F9174F08f30084220683948B105D1B1', defaultTokens: [wxDAI, xDAI_USDC, xDAI_USDT] },

  {
    chainId: 43114,
    router: '0xFE90eb3FbCddacD248fAFEFb9eAa24F5eF095778',
    defaultTokens: [AVAX_WETH_e, AVAX_USDC, AVAX_USDt, AVAX_YUSD, AVAX_DAI_e, AVAX_USDC_e],
  },

  {
    chainId: 250,
    router: '0x7661a508a0c4c2d305f355F7850D87b69431e897',
    defaultTokens: [FTM_ETH, FTM_DAI, FTM_USDC, FTM_WBTC],
  },
];

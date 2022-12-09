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
  CELO_USD,
  CELO_USDC,
  CELO_USDT,
  CRV,
  CVX,
  DAI,
  FRAX,
  FTM_DAI,
  FTM_ETH,
  FTM_USDC,
  FTM_WBTC,
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
  USDC,
  USDT,
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
    router: '0x55B916Ce078eA594c10a874ba67eCc3d62e29822',
    defaultTokens: [DAI, USDC, USDT, sUSD, CRV, CVX, sETH, stETH, renBTC, WBTC, MIM, FRAX],
  },

  {
    chainId: 10,
    router: '0x9CF512116Fb29eC1dD3798E6eA9A7cd9D18bBeD1',
    defaultTokens: [OP_USDC, OP_DAI, OP_USDT],
  },

  {
    chainId: 42161,
    router: '0x3CcD107D72bc855D591df92D3b7C7E4E75F0957C',
    defaultTokens: [ARBI_USDC, ARBI_USDT, ARBI_renBTC, ARBI_WBTC],
  },

  {
    chainId: 137,
    router: '0xa522deb6F17853F3a97a65d0972a50bDC3B1AFFF',
    defaultTokens: [MATIC_WETH, MATIC_DAI, MATIC_USDC, MATIC_USDT, MATIC_WBTC],
  },

  { chainId: 100, router: '0xE6358f6a45B502477e83CC1CDa759f540E4459ee', defaultTokens: [wxDAI, xDAI_USDC, xDAI_USDT] },

  {
    chainId: 43114,
    router: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
    defaultTokens: [AVAX_WETH_e, AVAX_USDC, AVAX_USDt, AVAX_YUSD, AVAX_DAI_e, AVAX_USDC_e],
  },

  {
    chainId: 250,
    router: '0x16243caB3aC4d8eE8df7660a525F7F7539962468',
    defaultTokens: [FTM_ETH, FTM_DAI, FTM_USDC, FTM_WBTC],
  },

  {
    chainId: 42220,
    router: '0xec9cEBE650E181079576C1b6d0d2e092B1EdfF13',
    defaultTokens: [CELO_USD, CELO_USDC, CELO_USDT],
  },
];

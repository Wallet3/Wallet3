import {
  ArbiPopularTokens,
  BscPopularTokens,
  CeloPopularTokens,
  EthereumPopularTokens,
  FTMPopularTokens,
  HecoPopularTokens,
  IToken,
  PolygonPopularTokens,
  xDaiPopularTokens,
  zkSyncTestPopularTokens,
} from './Tokens';

export interface INetwork {
  comm_id: string;
  symbol: string;
  network: string;
  chainId: number;
  color: string;
  test?: boolean;
  l2?: boolean;
  eip1559?: boolean;
  order?: number;
  defaultTokens: IToken[];
  showOverview?: boolean;
  blockTimeMs?: number;
  explorer: string;
}

export const PublicNetworks: INetwork[] = [
  {
    symbol: 'ETH',
    comm_id: 'eth',
    network: 'Ethereum',
    chainId: 1,
    color: '#6186ff',
    eip1559: true,
    order: 1,
    defaultTokens: EthereumPopularTokens,
    showOverview: true,
    blockTimeMs: 12 * 1000,
    explorer: 'https://etherscan.io',
  },
  {
    symbol: 'ETH',
    comm_id: 'arb',
    network: 'Arbitrum One',
    chainId: 42161,
    color: '#28a0f0',
    order: 3,
    l2: true,
    defaultTokens: ArbiPopularTokens,
    showOverview: false,
    explorer: 'https://arbiscan.io',
  },
  {
    symbol: 'ETH',
    comm_id: 'op',
    network: 'Optimism',
    chainId: 10,
    color: '#FF0420',
    order: 3,
    l2: true,
    defaultTokens: [],
    showOverview: false,
    explorer: 'https://optimistic.etherscan.io',
  },
  {
    symbol: 'MATIC',
    comm_id: 'matic',
    network: 'Polygon',
    chainId: 137,
    color: '#8247E5',
    order: 2,
    defaultTokens: PolygonPopularTokens,
    showOverview: true,
    blockTimeMs: 3 * 1000,
    explorer: 'https://polygonscan.com',
  },
  {
    symbol: 'xDAI',
    comm_id: 'xdai',
    network: 'xDai',
    chainId: 100,
    color: '#48A9A6',
    order: 3,
    defaultTokens: xDaiPopularTokens,
    showOverview: true,
    blockTimeMs: 5 * 1000,
    explorer: 'https://blockscout.com/xdai/mainnet',
    eip1559: true,
  },
  {
    symbol: 'FTM',
    comm_id: 'ftm',
    chainId: 250,
    network: 'Fantom',
    color: '#13b5ec',
    order: 4,
    defaultTokens: FTMPopularTokens,
    showOverview: true,
    blockTimeMs: 10 * 1000,
    explorer: 'https://ftmscan.com',
  },
  {
    symbol: 'AVAX',
    comm_id: 'avax',
    chainId: 43114,
    network: 'Avalanche',
    color: '#E84142',
    order: 5,
    eip1559: true,
    defaultTokens: [],
    showOverview: true,
    blockTimeMs: 5 * 1000,
    explorer: 'https://snowtrace.io',
  },
  {
    symbol: 'CELO',
    comm_id: 'celo',
    chainId: 42220,
    network: 'Celo',
    color: '#35D07F',
    order: 6,
    defaultTokens: CeloPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://explorer.celo.org',
  },
  // {
  //   symbol: 'BCH',
  //   comm_id: 'bch',
  //   chainId: 10000,
  //   network: 'SmartBCH',
  //   order: 7,
  //   color: '#8dc351',
  //   defaultTokens: [],
  // },
  {
    symbol: 'HT',
    comm_id: 'heco',
    chainId: 128,
    network: 'Heco',
    order: 6,
    color: '#3F7FFF',
    defaultTokens: HecoPopularTokens,
    blockTimeMs: 5 * 1000,
    explorer: 'https://hecoinfo.com',
  },
  {
    symbol: 'OKB',
    comm_id: 'okt',
    chainId: 66,
    network: 'OKEx',
    order: 7,
    color: '#24c',
    defaultTokens: [],
    blockTimeMs: 5 * 1000,
    explorer: 'https://www.oklink.com/okexchain',
  },
  {
    symbol: 'BNB',
    comm_id: 'bsc',
    network: 'BSC',
    chainId: 56,
    color: '#f3ba2f',
    order: 5,
    defaultTokens: BscPopularTokens,
    showOverview: true,
    blockTimeMs: 5 * 1000,
    explorer: 'https://bscscan.com',
  },
];

export const Testnets: INetwork[] = [
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Ropsten',
    chainId: 3,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
    explorer: 'https://ropsten.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Rinkeby',
    chainId: 4,
    color: '#6186ff',
    test: true,
    eip1559: true,
    defaultTokens: [],
    explorer: 'https://rinkeby.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Goerli',
    chainId: 5,
    color: '#6186ff',
    eip1559: true,
    test: true,
    defaultTokens: [],
    explorer: 'https://goerli.etherscan.io',
  },
  {
    comm_id: '',
    symbol: 'ETH',
    network: 'Kovan',
    chainId: 42,
    color: '#6186ff',
    test: true,
    defaultTokens: [],
    explorer: 'https://kovan.etherscan.io',
  },
];

export const Networks: INetwork[] = [...PublicNetworks, ...Testnets];
export const ChainIdsSymbol = new Map<number, string>(Networks.map((n) => [n.chainId, n.symbol]));
export const ChainIdToNetwork = new Map<number, INetwork>(Networks.map((n) => [n.chainId, n]));

import { OP_WETH } from '../tokens/Optimism';

export default {
  '': {
    name: 'ETH/USD',
    oracle: '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
  },

  '0x4200000000000000000000000000000000000042': {
    name: 'OP/USD',
    oracle: '0x0D276FC14719f9292D5C1eA2198673d1f4269246',
  },

  '0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53': {
    name: 'CRV/USD',
    oracle: '0xbD92C6c284271c227a1e0bF1786F468b539f51D9',
  },

  '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6': {
    name: 'LINK/USD',
    oracle: '0xCc232dcFAAE6354cE191Bd574108c1aD03f86450',
  },
};

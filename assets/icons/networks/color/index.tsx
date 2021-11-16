import Arbitrum from './arbitrum.svg';
import Avalanche from './avalanche.svg';
import Bsc from './bsc.svg';
import Celo from './celo.svg';
import Ethereum from './ethereum2.svg';
import Fantom from './fantom.svg';
import Heco from './heco.svg';
import Mumbai from './mumbai.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import React from 'react';
import XDai from './xdai.svg';
import ZKSync from './zksync.svg';

export { Arbitrum, Avalanche, Bsc, Celo, Ethereum, Fantom, Heco, Mumbai, OKEx, Optimism, Polygon, XDai, ZKSync };

const ETH = <Ethereum width={32} height={32} style={{ marginHorizontal: -5 }} />;
const ARB = <Arbitrum width={32} height={32} />;
const OPT = <Optimism width={32} height={32} />;
const AVL = <Avalanche width={32} height={32} />;
const BSC = <Bsc width={32} height={32} />;
const CELO = <Celo width={32} height={32} />;
const FTM = <Fantom width={32} height={32} />;
const HECO = <Heco width={32} height={32} />;
const OKX = <OKEx width={32} height={32} />;
const POLY = <Polygon width={27} height={32} />;
const xDAI = <XDai width={32} height={32} />;
const ZSYNC = <ZKSync width={32} height={32} />;

export const NetworkIcons = {
  1: ETH,
  42161: ARB,
  10: OPT,
  43114: AVL,
  56: BSC,
  42220: CELO,
  250: FTM,
  128: HECO,
  66: OKX,
  137: POLY,
  100: xDAI,
  // zksync: ZSYNC,
};

import { StyleProp, ViewStyle } from 'react-native';

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

const ETH = generateNetworkIcon({ chainId: 1, width: 32, style: { marginHorizontal: -5 } }); // <Ethereum width={32} height={32} style={{ marginHorizontal: -5 }} />;
const ARB = generateNetworkIcon({ chainId: 42161, width: 32 });
const OPT = generateNetworkIcon({ chainId: 10, width: 32 });
const AVL = generateNetworkIcon({ chainId: 43114, width: 32 });
const BSC = generateNetworkIcon({ chainId: 56, width: 32 });
const CELO = generateNetworkIcon({ chainId: 42220, width: 32 });
const FTM = generateNetworkIcon({ chainId: 250, width: 32 });
const HECO = generateNetworkIcon({ chainId: 128, width: 32 });
const OKX = generateNetworkIcon({ chainId: 66, width: 32 });
const POLY = generateNetworkIcon({ chainId: 137, width: 27, height: 32 });
const xDAI = generateNetworkIcon({ chainId: 100, width: 32 });
// const ZSYNC = <ZKSync width={32} height={32} />;

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

export function generateNetworkIcon(props: { chainId: number; width: number; height?: number; style?: StyleProp<ViewStyle> }) {
  const { chainId, width, height, style } = props;

  switch (chainId) {
    case 1:
      return <Ethereum key={chainId} width={width} height={height ?? width} style={style} />;
    case 42161:
      return <Arbitrum key={chainId} width={width} height={height ?? width} style={style} />;
    case 10:
      return <Optimism key={chainId} width={width} height={height ?? width} style={style} />;
    case 137:
      return <Polygon key={chainId} width={width} height={height ?? width} style={style} />;
    case 100:
      return <XDai key={chainId} width={width} height={height ?? width} style={style} />;
    case 43114:
      return <Avalanche key={chainId} width={width} height={height ?? width} style={style} />;
    case 56:
      return <Bsc key={chainId} width={width} height={height ?? width} style={style} />;
    case 42220:
      return <Celo key={chainId} width={width} height={height ?? width} style={style} />;
    case 250:
      return <Fantom key={chainId} width={width} height={height ?? width} style={style} />;
    case 128:
      return <Heco key={chainId} width={width} height={height ?? width} style={style} />;
    case 66:
      return <OKEx key={chainId} width={width} height={height ?? width} style={style} />;
  }
}

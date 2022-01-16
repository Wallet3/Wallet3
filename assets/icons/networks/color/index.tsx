import { Entypo, Feather } from '@expo/vector-icons';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import Arbitrum from './arbitrum.svg';
import Aurora from './aurora.svg';
import Avalanche from './avalanche.svg';
import Boba from './boba.svg';
import Bsc from './bsc.svg';
import Celo from './celo.svg';
import Cronos from './cronos.svg';
import Ethereum from './ethereum2.svg';
import EthereumClassic from './ethereum-classic.svg';
import Fantom from './fantom.svg';
import HarmonyOne from './harmony-one.svg';
import Heco from './heco.svg';
import Mumbai from './mumbai.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import React from 'react';
import XDai from './xdai.svg';
import ZKSync from './zksync.svg';

export const EVMIcon = ({
  color,
  size,
  style,
  hideEVMTitle,
}: {
  title?: string;
  color: string;
  size?: number;
  style?: any;
  hideEVMTitle?: boolean;
}) => {
  return (
    <View style={{ ...style, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
      <Entypo name="network" size={size ?? 30} color={color} />
      {hideEVMTitle ? undefined : <Text style={{ fontSize: 5, fontWeight: '500', color }}>{'EVM'}</Text>}
    </View>
  );
};

const Moonriver = () => <EVMIcon title="Moonriver" color="#53cbc9" />;

export { Arbitrum, Avalanche, Bsc, Celo, Ethereum, Fantom, Heco, Mumbai, OKEx, Optimism, Polygon, XDai, ZKSync, Moonriver };

const ETH = generateNetworkIcon({ chainId: 1, width: 32, style: { marginHorizontal: -5 } });
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
const BOBA = generateNetworkIcon({ chainId: 288, width: 32 });
const AURORA = generateNetworkIcon({ chainId: 1313161554, width: 32 });
const HARMONYONE = generateNetworkIcon({ chainId: 1666600000, width: 34, height: 32, style: { marginHorizontal: -5 } });
const CRONOS = generateNetworkIcon({ chainId: 25, width: 32, style: { marginStart: 0 } });
const ETC = generateNetworkIcon({ chainId: 61, width: 32, height: 30, style: { marginHorizontal: -5, marginVertical: 1 } });
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
  288: BOBA,
  1313161554: AURORA,
  1666600000: HARMONYONE,
  25: CRONOS,
  61: ETC,
  // zksync: ZSYNC,
};

export function generateNetworkIcon(props: {
  chainId: number;
  color?: string;
  width: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  hideEVMTitle?: boolean;
}) {
  const { chainId, width, height, style, color, hideEVMTitle } = props;

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
    case 288:
      return <Boba key={chainId} width={width} height={height ?? width} style={style} />;
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
    case 1313161554:
      return <Aurora key={chainId} width={width} height={height ?? width} style={style} />;
    case 1666600000:
    case 1666600001:
    case 1666600002:
    case 1666600003:
      return <HarmonyOne key={chainId} width={width} height={height ?? width} style={style} />;
    case 25:
      return <Cronos key={chainId} width={width} height={height ?? width} style={style} />;
    case 61:
      return <EthereumClassic key={chainId} width={width} height={height ?? width} style={style} />;
    default:
      return <EVMIcon key={chainId} size={width} color={color!} style={style} hideEVMTitle={hideEVMTitle} />;
  }
}

import { StyleProp, Text, View, ViewStyle } from 'react-native';

import Arbitrum from './arbitrum.svg';
import Aurora from './aurora.svg';
import Avalanche from './avalanche.svg';
import Base from './base.svg';
import Boba from './boba.svg';
import Bsc from './bnb.svg';
import Canto from './canto.svg';
import Celo from './celo.svg';
import { Coin } from '../../../../components';
import Conflux from './conflux.svg';
import Consensys from './consensys.svg';
import Cronos from './cronos.svg';
import { Entypo } from '@expo/vector-icons';
import Ethereum from './ethereum2.svg';
import EthereumClassic from './ethereum-classic.svg';
import Evmos from './evmos.svg';
import Fantom from './fantom.svg';
import FastImage from 'react-native-fast-image';
import Findora from './findora.svg';
import Fuse from './fuse.svg';
import Harmony from './harmony-one.svg';
import Heco from './heco.svg';
import JapanOpenChain from './japanopenchain.svg';
import Kava from './kava.svg';
import Klaytn from './klaytn.svg';
import Metis from './metis.svg';
import Moonbeam from './moonbeam.svg';
import Moonriver from './moonriver.svg';
import Mumbai from './mumbai.svg';
import Nova from './nova.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import PolygonZkEVM from './polygon-zkevm.svg';
import React from 'react';
import Ronin from './ronin.svg';
import Shiden from './shiden.svg';
import XDai from './xdai.svg';
import ZKSync from './zksync.svg';
import coins from '../../crypto';
import styles from '../styles';

const ScrollImg = require('./scroll.png');

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
    <View style={{ ...style, position: 'relative', justifyContent: 'center', alignItems: 'center', paddingBottom: 1 }}>
      <Entypo name="network" size={size ?? 30} color={color} />
      {hideEVMTitle ? undefined : <Text style={{ fontSize: 5, fontWeight: '500', color }}>{'EVM'}</Text>}
    </View>
  );
};

export {
  Arbitrum,
  Avalanche,
  Bsc,
  Celo,
  Ethereum,
  Fantom,
  Heco,
  Mumbai,
  OKEx,
  Optimism,
  Polygon,
  XDai,
  ZKSync,
  Moonriver,
  Moonbeam,
};

const ETH = generateNetworkIcon({ chainId: 1, width: 32, style: { marginHorizontal: -5 } });
const ARB = generateNetworkIcon({ chainId: 42161, width: 32 });
const OPT = generateNetworkIcon({ chainId: 10, width: 30, height: 32 });
const AVL = generateNetworkIcon({ chainId: 43114, width: 30, height: 32 });
const BSC = generateNetworkIcon({ chainId: 56, width: 30, height: 32 });
const CELO = generateNetworkIcon({ chainId: 42220, width: 32, height: 30 });
const FTM = generateNetworkIcon({ chainId: 250, width: 32 });
const HECO = generateNetworkIcon({ chainId: 128, width: 32 });
const OKX = generateNetworkIcon({ chainId: 66, width: 32 });
const POLY = generateNetworkIcon({ chainId: 137, width: 27, height: 32 });
const POLYGONZKEVM = generateNetworkIcon({ chainId: 1101, width: 29, height: 32 });
const xDAI = generateNetworkIcon({ chainId: 100, width: 32 });
const BOBA = generateNetworkIcon({ chainId: 288, width: 32 });
const AURORA = generateNetworkIcon({ chainId: 1313161554, width: 32 });
const HARMONYONE = generateNetworkIcon({
  chainId: 1666600000,
  width: 37,
  height: 37,
  style: { marginHorizontal: -5, marginVertical: -2.5 },
});
const CRONOS = generateNetworkIcon({ chainId: 25, width: 32, style: { marginStart: 0 } });
const ETC = generateNetworkIcon({ chainId: 61, width: 32, height: 30, style: { marginHorizontal: -5, marginVertical: 1 } });
const MOONRIVER = generateNetworkIcon({
  chainId: 1285,
  width: 32,
  height: 32,
  style: { marginHorizontal: -2, marginVertical: 1 },
});
const MOONBEAM = generateNetworkIcon({ chainId: 1284, width: 32, height: 32 });
const RONIN = generateNetworkIcon({ chainId: 2020, width: 32, height: 32 });
const ZSYNC = generateNetworkIcon({ chainId: 280, width: 32, height: 32, style: { marginStart: 0 } });
const KLAYTN = generateNetworkIcon({ chainId: 8217, width: 27, height: 32 });
const FINDORA = generateNetworkIcon({ chainId: 2152, width: 32, height: 32 });
const METIS = generateNetworkIcon({ chainId: 1088, width: 42, style: { marginVertical: -5, marginStart: -4 } });
const FUSE = generateNetworkIcon({ chainId: 122, width: 27, height: 32 });
const SHIDEN = generateNetworkIcon({ chainId: 336, width: 22, height: 32 });
const EVMOS = generateNetworkIcon({ chainId: 9001, width: 29, height: 32 });
const KAVA = generateNetworkIcon({ chainId: 2222, width: 19, height: 32 });
const NOVA = generateNetworkIcon({ chainId: 42170, width: 27, height: 32 });
const CANTO = generateNetworkIcon({ chainId: 7700, width: 27, height: 32 });
const BASE = generateNetworkIcon({ chainId: 84531, width: 27, height: 32 });
const JOC = generateNetworkIcon({ chainId: 99999, width: 27, height: 32 });
const SCROLL = generateNetworkIcon({ chainId: 534353, width: 27, height: 32 });
const CONFLUX = generateNetworkIcon({ chainId: 1030, width: 27, height: 32 });

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
  1101: POLYGONZKEVM,
  1442: POLYGONZKEVM,
  80001: POLY,
  100: xDAI,
  288: BOBA,
  1313161554: AURORA,
  1666600000: HARMONYONE,
  25: CRONOS,
  61: ETC,
  1284: MOONBEAM,
  1285: MOONRIVER,
  2020: RONIN,
  280: ZSYNC,
  324: ZSYNC,
  8217: KLAYTN,
  2152: FINDORA,
  1088: METIS,
  122: FUSE,
  336: SHIDEN,
  9001: EVMOS,
  2222: KAVA,
  42170: NOVA,
  7700: CANTO,
  84531: BASE,
  99999: JOC,
  534353: SCROLL,
  1030: CONFLUX,
};

export function generateNetworkIcon(props: {
  chainId: number;
  color?: string;
  width: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  hideEVMTitle?: boolean;
  symbol?: string;
}) {
  const { chainId, width, height, style, color, hideEVMTitle, symbol } = props;

  switch (chainId) {
    case 1:
      return <Ethereum key={chainId} width={width} height={height ?? width} style={style} />;
    case 42161:
    case 421613:
      return <Arbitrum key={chainId} width={width} height={height ?? width} style={style} />;
    case 10:
    case 420:
      return <Optimism key={chainId} width={width} height={height ?? width} style={style} />;
    case 137:
    case 80001:
      return <Polygon key={chainId} width={width} height={height ?? width} style={style} />;
    case 1101:
    case 1442:
      return <PolygonZkEVM key={chainId} width={width} height={height ?? width} style={style} />;
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
      return <Harmony key={chainId} width={width} height={height ?? width} style={style} />;
    case 25:
      return <Cronos key={chainId} width={width} height={height ?? width} style={style} />;
    case 61:
      return <EthereumClassic key={chainId} width={width} height={height ?? width} style={style} />;
    case 1284:
      return <Moonbeam key={chainId} width={width} height={height ?? width} style={style} />;
    case 1285:
      return <Moonriver key={chainId} width={width} height={height ?? width} style={style} />;
    case 2020:
      return <Ronin key={chainId} width={width} height={height ?? width} style={style} />;
    case 280:
    case 324:
      return <ZKSync key={chainId} width={width} height={height ?? width} style={style} />;
    case 8217:
      return <Klaytn key={chainId} width={width} height={height ?? width} style={style} />;
    case 2152:
      return <Findora key={chainId} width={width} height={height ?? width} style={style} />;
    case 1088:
      return (
        <Metis
          key={chainId}
          width={width + (style ? 0 : 9)}
          height={(height ?? width) + (style ? 0 : 9)}
          style={{ ...(style || ({ margin: -9, marginEnd: -3 } as any)) }}
        />
      );
    case 122:
      return <Fuse key={chainId} width={width} height={height ?? width} style={style} />;
    case 336:
      return <Shiden key={chainId} width={width} height={height ?? width} style={style} />;
    case 9001:
      return <Evmos key={chainId} width={width} height={height ?? width} style={style} />;
    case 2222:
      return <Kava key={chainId} width={width} height={height ?? width} style={style} />;
    case 42170:
      return <Nova key={chainId} width={width} height={height ?? width} style={style} />;
    case 7700:
      return <Canto key={chainId} width={width} height={height ?? width} style={style} />;
    case 84531:
      return <Base key={chainId} width={width} height={height ?? width} style={style} />;
    case 99999:
      return <JapanOpenChain key={chainId} width={width} height={height ?? width} style={style} />;
    case 59140:
      return <Consensys key={chainId} width={width} height={height ?? width} style={style} />;
    case 534353:
      return <FastImage key={chainId} source={ScrollImg} style={[{ width, height }, style as any]} />;
    case 1030:
      return <Conflux key={chainId} width={width} height={height ?? width} style={style} />;
    default:
      return coins[symbol?.toLowerCase() || ''] ? (
        <Coin key={chainId} symbol={symbol} size={height ?? width} address="" chainId={chainId} style={style as any} />
      ) : (
        <EVMIcon key={chainId} size={width} color={color!} style={style} hideEVMTitle={hideEVMTitle} />
      );
  }
}

export default {
  1: <Ethereum width={52} height={52} style={{ ...styles.ethereum, marginTop: -47, marginEnd: -12, opacity: 1 }} />,
  42161: <Arbitrum width={48} height={48} style={{ ...styles.arbitrum, marginTop: -45, marginEnd: -4, opacity: 1 }} />,
  10: <Optimism width={47} height={47} style={{ ...styles.optimism, marginTop: -44, marginEnd: -2, opacity: 1 }} />,
  100: <XDai width={45} height={45} style={{ ...styles.xdai, marginTop: -43, marginEnd: -1, opacity: 1 }} />,
  137: <Polygon width={40} height={40} style={{ ...styles.polygon, marginTop: -36, marginEnd: -2, opacity: 1 }} />,
  80001: <Polygon width={40} height={40} style={{ ...styles.polygon, marginTop: -36, marginEnd: -2, opacity: 1 }} />,
  43114: <Avalanche width={43} height={43} style={{ ...styles.avalanche, marginTop: -42, marginEnd: -2, opacity: 1 }} />,
  250: <Fantom width={45} height={45} style={{ ...styles.fantom, marginTop: -43, marginEnd: -2, opacity: 1 }} />,
  42220: <Celo width={42} height={42} style={{ ...styles.celo, marginTop: -43, marginEnd: -2, opacity: 1 }} />,
  128: <Heco width={52} height={52} style={{ ...styles.heco, opacity: 1 }} />,
  66: <OKEx width={49} height={49} style={{ ...styles.okex, opacity: 1 }} />,
  56: <Bsc width={42} height={42} style={{ ...styles.bsc, opacity: 1 }} />,
  288: <Boba width={49} height={49} style={{ ...styles.boba, opacity: 1 }} />,
  1313161554: <Aurora width={45} height={45} style={{ ...styles.aurora, marginTop: -43, marginEnd: -1, opacity: 1 }} />,
  25: <Cronos width={49} height={49} style={{ ...styles.cronos, opacity: 1 }} />,
  1666600000: <Harmony width={52} height={52} style={{ ...styles.harmony, opacity: 1 }} />,
  2020: <Ronin width={40} height={40} style={{ ...styles.ronin, opacity: 1 }} />,
  280: <ZKSync width={49} height={49} style={{ ...styles.zkSync, opacity: 1 }} />,
  1284: <Moonbeam width={42} height={42} style={{ ...styles.moonbeam, opacity: 1 }} />,
  1285: <Moonriver width={42} height={42} style={{ ...styles.moonriver, opacity: 1 }} />,
  122: <Fuse width={32} height={32} style={{ ...styles.fuse, opacity: 1 }} />,
  336: <Shiden width={40} height={40} style={{ ...styles.shiden, opacity: 1 }} />,
  59140: <Consensys width={40} height={40} style={{ ...styles.shiden, opacity: 1 }} />,
};

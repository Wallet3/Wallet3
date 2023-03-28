import { StyleProp, Text, View, ViewStyle } from 'react-native';

import Arbitrum from './arbitrum.svg';
import Aurora from './aurora.svg';
import Avalanche from './avalanche.svg';
import BSC from './bnb.svg';
import Base from './base.svg';
import Boba from './boba.svg';
import Canto from './canto.svg';
import Celo from './celo.svg';
import { Coin } from '../../../../components';
import Cronos from './cronos.svg';
import { Entypo } from '@expo/vector-icons';
import Ethereum from './ethereum.svg';
import Evmos from './evmos.svg';
import Fantom from './fantom.svg';
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
import Nova from './nova.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import React from 'react';
import Ronin from './ronin.svg';
import Shiden from './shiden.svg';
import XDai from './xdai.svg';
import ZKSync from './zksync.svg';
import coins from '../../crypto';
import styles from '../styles';

export default {
  1: <Ethereum width={64} height={64} style={styles.ethereum} />,
  42161: <Arbitrum width={54} height={54} style={styles.arbitrum} />,
  10: <Optimism width={47} height={47} style={styles.optimism} />,
  100: <XDai width={50} height={50} style={styles.xdai} />,
  137: <Polygon width={45} height={45} style={styles.polygon} />,
  43114: <Avalanche width={60} height={60} style={styles.avalanche} />,
  250: <Fantom width={60} height={60} style={styles.fantom} />,
  42220: <Celo width={49} height={49} style={styles.celo} />,
  128: <Heco width={52} height={52} style={styles.heco} />,
  66: <OKEx width={49} height={49} style={styles.okex} />,
  56: <BSC width={42} height={42} style={styles.bsc} />,
  288: <Boba width={49} height={49} style={styles.boba} />,
  1313161554: <Aurora width={49} height={49} style={styles.aurora} />,
  25: <Cronos width={49} height={49} style={styles.cronos} />,
  1666600000: <Harmony width={52} height={52} style={styles.harmony} />,
  2020: <Ronin width={42} height={42} style={styles.ronin} />,
  280: <ZKSync width={52} height={52} style={styles.zkSync} />,
  324: <ZKSync width={52} height={52} style={styles.zkSync} />,
  1088: <Metis width={64} height={64} style={styles.metis} />,
  8217: <Klaytn width={37} height={37} style={styles.klaytn} />,
  2152: <Findora width={42} height={42} style={styles.findora} />,
  1284: <Moonbeam width={42} height={42} style={styles.moonbeam} />,
  1285: <Moonriver width={42} height={42} style={styles.moonriver} />,
  122: <Fuse width={32} height={32} style={styles.fuse} />,
  336: <Shiden width={40} height={40} style={styles.shiden} />,
  2222: <Kava width={40} height={30} style={styles.kava} />,
  42170: <Nova width={45} height={45} style={styles.nova} />,
  7700: <Canto width={45} height={45} style={styles.canto} />,
  84531: <Base width={45} height={45} style={styles.canto} />,
  99999: <JapanOpenChain width={45} height={45} style={styles.canto} />,
};

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
      return <BSC key={chainId} width={width} height={height ?? width} style={style} />;
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
    case 84531:
      return <Base key={chainId} width={width} height={height ?? width} style={style} />;
    case 99999:
      return <JapanOpenChain key={chainId} width={width} height={height ?? width} style={style} />;
    default:
      return coins[symbol?.toLowerCase() || ''] ? (
        <Coin symbol={symbol} size={height ?? width} address="" chainId={chainId} style={style as any} />
      ) : (
        <EVMIcon key={chainId} size={width} color={color!} style={style} hideEVMTitle={hideEVMTitle} />
      );
  }
}

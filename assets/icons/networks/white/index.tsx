import Arbitrum from './arbitrum.svg';
import Avalanche from './avalanche.svg';
import BSC from './bsc.svg';
import Celo from './celo.svg';
import Ethereum from './ethereum.svg';
import Fantom from './fantom.svg';
import Heco from './heco.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import React from 'react';
import { StyleSheet } from 'react-native';
import XDai from './xdai.svg';

const styles = StyleSheet.create({
  ethereum: {
    marginTop: -60,
    marginEnd: -19,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  arbitrum: {
    marginTop: -57,
    marginEnd: -10,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  optimism: {
    marginTop: -57,
    marginEnd: -6,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  polygon: {
    marginTop: -52,
    marginEnd: -4,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  xdai: {
    marginTop: -55,
    marginEnd: -6,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  fantom: {
    marginTop: -57,
    marginEnd: -14,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  avalanche: {
    marginTop: -54,
    marginEnd: -10,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  celo: {
    marginTop: -57,
    marginEnd: -5,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  heco: {
    marginTop: -55,
    marginEnd: -10,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  okex: {
    marginTop: -54,
    marginEnd: -6,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  bsc: {
    marginTop: -54,
    marginEnd: -6,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },
});

export default {
  Ethereum: <Ethereum width={64} height={64} style={styles.ethereum} />,
  Arbitrum: <Arbitrum width={54} height={54} style={styles.arbitrum} />,
  Optimism: <Optimism width={54} height={54} style={styles.optimism} />,
  xDai: <XDai width={50} height={50} style={styles.xdai} />,
  Polygon: <Polygon width={49} height={49} style={styles.polygon} />,
  Avalanche: <Avalanche width={60} height={60} style={styles.avalanche} />,
  Fantom: <Fantom width={60} height={60} style={styles.fantom} />,
  Celo: <Celo width={52} height={52} style={styles.celo} />,
  Heco: <Heco width={52} height={52} style={styles.heco} />,
  OKEx: <OKEx width={49} height={49} style={styles.okex} />,
  BSC: <BSC width={49} height={49} style={styles.bsc} />,
};

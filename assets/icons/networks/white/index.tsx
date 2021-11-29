import Arbitrum from './arbitrum.svg';
import Avalanche from './avalanche.svg';
import BSC from './bsc.svg';
import Boba from './boba.svg';
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
    marginTop: -52,
    marginEnd: -17,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  arbitrum: {
    marginTop: -50,
    marginEnd: -5,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  optimism: {
    marginTop: -52,
    marginEnd: -2,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  boba: {
    marginTop: -40,
    marginEnd: -12,
    alignSelf: 'flex-end',
    opacity: 1,
  },

  polygon: {
    marginTop: -40,
    marginEnd: -0,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  xdai: {
    marginTop: -48,
    marginEnd: -2,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  fantom: {
    marginTop: -46,
    marginEnd: -14,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  avalanche: {
    marginTop: -45,
    marginEnd: -8,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  celo: {
    marginTop: -47,
    marginEnd: -5,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  heco: {
    marginTop: -46,
    marginEnd: -10,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  okex: {
    marginTop: -48,
    marginEnd: -2,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },

  bsc: {
    marginTop: -47,
    marginEnd: -3,
    alignSelf: 'flex-end',
    opacity: 0.72,
  },
});

export default {
  1: <Ethereum width={64} height={64} style={styles.ethereum} />,
  42161: <Arbitrum width={54} height={54} style={styles.arbitrum} />,
  10: <Optimism width={54} height={54} style={styles.optimism} />,
  100: <XDai width={50} height={50} style={styles.xdai} />,
  137: <Polygon width={45} height={45} style={styles.polygon} />,
  43114: <Avalanche width={60} height={60} style={styles.avalanche} />,
  250: <Fantom width={60} height={60} style={styles.fantom} />,
  42220: <Celo width={49} height={49} style={styles.celo} />,
  128: <Heco width={52} height={52} style={styles.heco} />,
  66: <OKEx width={49} height={49} style={styles.okex} />,
  56: <BSC width={49} height={49} style={styles.bsc} />,
  288: <Boba width={49} height={49} style={styles.boba} />,
};

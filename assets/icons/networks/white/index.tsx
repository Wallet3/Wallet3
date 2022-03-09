import Arbitrum from './arbitrum.svg';
import Aurora from './aurora.svg';
import Avalanche from './avalanche.svg';
import BSC from './bsc.svg';
import Boba from './boba.svg';
import Celo from './celo.svg';
import Cronos from './cronos.svg';
import Ethereum from './ethereum.svg';
import Fantom from './fantom.svg';
import Harmony from './harmony-one.svg';
import Heco from './heco.svg';
import Metis from './metis.svg';
import OKEx from './okex.svg';
import Optimism from './optimism.svg';
import Polygon from './polygon.svg';
import React from 'react';
import Ronin from './ronin.svg';
import XDai from './xdai.svg';
import ZkSync from './zksync.svg';
import styles from '../styles';

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
  1313161554: <Aurora width={49} height={49} style={styles.aurora} />,
  25: <Cronos width={49} height={49} style={styles.cronos} />,
  1666600000: <Harmony width={52} height={52} style={styles.harmony} />,
  2020: <Ronin width={42} height={42} style={styles.ronin} />,
  280: <ZkSync width={49} height={49} style={styles.zkSync} />,
  1088: <Metis width={64} height={64} style={styles.metis} />,
};

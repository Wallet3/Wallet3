import ERC4337Queue from '../../viewmodels/transferring/ERC4337Queue';
import PendingChains from './PendingChains';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

export default observer(() => {
  const { chainQueue } = ERC4337Queue;

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      <Swiper>
        <PendingChains vm={ERC4337Queue} onChainSelected={() => {}} />
      </Swiper>
    </SafeAreaProvider>
  );
});

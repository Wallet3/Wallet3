import React, { useRef, useState } from 'react';

import ERC4337Queue from '../../viewmodels/transferring/ERC4337Queue';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Swiper from 'react-native-swiper';
import TxsSelector from './TxsSelector';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

export default observer(() => {
  const { chainQueue } = ERC4337Queue;
  const [txs, setTxs] = useState<SendTxRequest[]>();
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      <Swiper ref={swiper}>
        <TxsSelector
          vm={ERC4337Queue}
          onTxsSelected={(txs) => {
            setTxs(txs);
            swiper.current?.scrollTo(1);
          }}
        />
      </Swiper>
    </SafeAreaProvider>
  );
});

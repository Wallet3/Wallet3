import React, { useRef, useState } from 'react';

import { BatchTransactionRequest } from '../../viewmodels/transferring/BatchTransactionRequest';
import BatchTxReview from './BatchTxReview';
import ERC4337Queue from '../../viewmodels/transferring/ERC4337Queue';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Swiper from 'react-native-swiper';
import TxsSelector from './TxsSelector';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

export default observer(() => {
  const { chainQueue } = ERC4337Queue;
  const [vm, setVM] = useState<BatchTransactionRequest>();
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
        <TxsSelector
          vm={ERC4337Queue}
          onTxsSelected={(args) => {
            setVM(new BatchTransactionRequest(args));
            setTimeout(() => swiper.current?.scrollTo(1));
          }}
        />

        {vm && <BatchTxReview vm={vm} />}
      </Swiper>
    </SafeAreaProvider>
  );
});

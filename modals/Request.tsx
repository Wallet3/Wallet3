import React, { useEffect, useRef, useState } from 'react';

import App from '../viewmodels/App';
import { NFCPad } from './views';
import Networks from '../viewmodels/Networks';
import { RequestAmount } from './views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { TransferRequesting } from '../viewmodels/TransferRequesting';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);
  const [vm] = useState(new TransferRequesting(Networks.current));
  const themeColor = Networks.current.color;

  const { avatar, address } = App.currentWallet?.currentAccount || {};

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
        removeClippedSubviews
        style={{ overflow: 'hidden' }}
      >
        <RequestAmount onNext={() => swiper.current?.scrollTo(1)} vm={vm} themeColor={themeColor} />
        <NFCPad onBack={() => swiper.current?.scrollTo(0)} vm={vm} themeColor={themeColor} />
      </Swiper>
    </SafeAreaProvider>
  );
});

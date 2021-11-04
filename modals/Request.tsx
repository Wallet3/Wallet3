import React, { useRef } from 'react';

import { NFCPad } from './views';
import { RequestAmount } from './views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
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
          <RequestAmount onNext={() => swiper.current?.scrollTo(1)} />
          <NFCPad onBack={() => swiper.current?.scrollTo(0)} />
        </Swiper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

import { AmountPad, NFCPad } from './views';
import React, { useRef } from 'react';

import { Numpad } from './views';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);

  return (
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
        <Numpad onNext={() => swiper.current?.scrollTo(1)} />
        <NFCPad onBack={() => swiper.current?.scrollTo(0)} />
      </Swiper>
    </SafeAreaView>
  );
});

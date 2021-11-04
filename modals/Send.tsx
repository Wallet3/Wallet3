import { ContactsPad, ReviewPad, SendAmount } from './views';
import React, { useRef, useState } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { Transferring } from '../viewmodels/Transferring';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);
  const [vm] = useState(new Transferring());

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
        >
          <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} vm={vm} />
          <SendAmount onBack={() => swiper.current?.scrollTo(0)} onNext={() => swiper.current?.scrollTo(2)} vm={vm} />
          <ReviewPad onBack={() => swiper.current?.scrollTo(1)} />
        </Swiper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

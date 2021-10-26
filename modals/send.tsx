import { AmountPad, ContactsPad, ReviewPad } from './views';
import React, { useRef } from 'react';

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
      >
        <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} />
        <AmountPad onBack={() => swiper.current?.scrollTo(0)} onNext={() => swiper.current?.scrollTo(2)} />
        <ReviewPad onBack={() => swiper.current?.scrollTo(1)} />
      </Swiper>
    </SafeAreaView>
  );
});

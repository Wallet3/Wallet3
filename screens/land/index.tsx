import React, { useRef } from 'react';
import { SafeAreaView, View } from 'react-native';

import ImportWallet from './importWallet';
import Swiper from 'react-native-swiper';
import Welcome from './welcome';

export default () => {
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
        <Welcome onImportWallet={() => swiper.current?.scrollTo(1)} />
        <ImportWallet />
      </Swiper>
    </SafeAreaView>
  );
};

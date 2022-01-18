import React, { useRef, useState } from 'react';

import MainPanel from './MainPanel';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import rootStyles from '../styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);
  const [type, setType] = useState('');

  return (
    <SafeAreaProvider style={rootStyles.safeArea}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <MainPanel />
      </Swiper>
    </SafeAreaProvider>
  );
});

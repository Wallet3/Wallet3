import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useRef, useState } from 'react';

import AmountPad from './AmountPad';
import App from '../../viewmodels/App';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { observer } from 'mobx-react-lite';

interface Props {
  onNext?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);
  const { currentWallet } = App;

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad onNext={props.onNext} disableBack onTokenPress={() => swiper.current?.scrollTo(1)} token={undefined} />
      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});

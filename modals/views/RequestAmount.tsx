import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useRef, useState } from 'react';

import AmountPad from './AmountPad';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

interface Props {
  onNext?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad onNext={props.onNext} disableBack onTokenPress={() => swiper.current?.scrollTo(1)} />
      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});

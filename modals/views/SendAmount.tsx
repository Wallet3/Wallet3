import React, { useRef } from 'react';

import AmountPad from './AmountPad';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { observer } from 'mobx-react-lite';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad onNext={props.onNext} onTokenPress={() => swiper.current?.scrollTo(1)} onBack={props.onBack} max="15.23" />
      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} onTokenSelected={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});

import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useRef, useState } from 'react';

import AmountPad from './AmountPad';
import App from '../../viewmodels/App';
import { IToken } from '../../common/Tokens';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { Transferring } from '../../viewmodels/Transferring';
import { observer } from 'mobx-react-lite';

interface Props {
  onNext?: () => void;
  vm: { token: IToken; allTokens: IToken[] };
}

export default observer(({ vm, onNext }: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad onNext={onNext} disableBack onTokenPress={() => swiper.current?.scrollTo(1)} token={vm.token!} />
      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} tokens={vm.allTokens} />
    </Swiper>
  );
});

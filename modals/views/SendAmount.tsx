import React, { useRef } from 'react';

import AmountPad from './AmountPad';
import { IToken } from '../../common/Tokens';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { Transferring } from '../../viewmodels/Transferring';
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
  vm: Transferring;
}

export default observer(({ onNext, onBack, vm }: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad
        onNext={onNext}
        onTokenPress={() => swiper.current?.scrollTo(1)}
        onBack={onBack}
        max={vm.token?.amount}
        token={vm.token}
      />
      <Tokenlist
        onBack={() => swiper.current?.scrollTo(0)}
        onTokenSelected={() => swiper.current?.scrollTo(0)}
        tokens={vm.allTokens}
      />
    </Swiper>
  );
});

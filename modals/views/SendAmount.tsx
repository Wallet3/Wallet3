import React, { useRef } from 'react';

import AmountPad from './AmountPad';
import Swiper from 'react-native-swiper';
import { TokenTransferring } from '../../viewmodels/TokenTransferring';
import Tokenlist from './Tokenlist';
import { observer } from 'mobx-react-lite';

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  vm: TokenTransferring;
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
        token={vm.token!}
        onNumChanged={(n) => vm.setAmount(n)}
        disableButton={!vm.isValidAmount}
      />

      <Tokenlist
        onBack={() => swiper.current?.scrollTo(0)}
        tokens={vm.allTokens}
        onTokenSelected={(token) => {
          swiper.current?.scrollTo(0);
          vm.setToken(token);
        }}
      />
    </Swiper>
  );
});

import React, { useRef } from 'react';

import AmountPad from './AmountPad';
import { ITokenMetadata } from '../../common/tokens';
import Swiper from 'react-native-swiper';
import Tokenlist from './Tokenlist';
import { TransferRequesting } from '../../viewmodels/transferring/TransferRequesting';
import { observer } from 'mobx-react-lite';

interface Props {
  onNext?: () => void;
  close?: () => void;
  vm: TransferRequesting;
  themeColor: string;
}

export default observer(({ vm, onNext, themeColor, close }: Props) => {
  const swiper = useRef<Swiper>(null);

  const selectToken = (token: ITokenMetadata) => {
    vm.setToken(token);
    swiper.current?.scrollTo(0);
  };

  const setAmount = (amount: string) => {
    vm.setAmount(amount);
  };

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <AmountPad
        account={vm.currentAccount}
        onNext={onNext}
        disableBack
        close={close}
        showMyQRCodeButton
        onTokenPress={() => swiper.current?.scrollTo(1)}
        token={vm.token!}
        onNumChanged={setAmount}
        disableButton={!vm.isValidAmount}
        themeColor={themeColor}
        network={vm.network}
      />

      <Tokenlist
        onBack={() => swiper.current?.scrollTo(0)}
        tokens={vm.allTokens}
        onTokenSelected={selectToken}
        selectedToken={vm.token}
        network={vm.network}
        themeColor={themeColor}
      />
    </Swiper>
  );
});

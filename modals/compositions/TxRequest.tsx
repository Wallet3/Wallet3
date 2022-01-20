import React, { useRef } from 'react';

import { Passpad } from '../views';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';
import RequestReview from '../dapp/RequestReview';
import Swiper from 'react-native-swiper';

interface Props {
  themeColor?: string;
  vm: RawTransactionRequest;
  app: { icon: string; name: string };
  onApprove: (pin?: string) => Promise<boolean>;
  onReject: () => void;
  biometricEnabled?: boolean;
}

export default ({ themeColor, vm, app, onApprove, onReject, biometricEnabled }: Props) => {
  const swiper = useRef<Swiper>(null);

  const approve = async () => {
    if (!biometricEnabled) {
      swiper.current?.scrollTo(1);
      return;
    }

    if (await onApprove()) return;

    swiper.current?.scrollTo(1);
  };

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <RequestReview vm={vm} app={app} onReject={onReject} onApprove={approve} account={vm.account} />
      <Passpad themeColor={themeColor} onCodeEntered={(c) => onApprove(c)} onCancel={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
};

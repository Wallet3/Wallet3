import React, { useRef } from 'react';

import { BioType } from '../../viewmodels/auth/Authentication';
import { Passpad } from '../views';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';
import RequestReview from '../dapp/RequestReview';
import Swiper from 'react-native-swiper';

interface Props {
  themeColor?: string;
  vm: RawTransactionRequest;
  app?: { icon: string; name: string; verified?: boolean };
  onApprove: (pin?: string) => Promise<boolean>;
  onReject: () => void;
  bioType?: BioType;
}

export default ({ themeColor, vm, app, onApprove, onReject, bioType }: Props) => {
  const swiper = useRef<Swiper>(null);

  const approve = async () => {
    if (!bioType) {
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
      <RequestReview vm={vm} app={app} onReject={onReject} onApprove={approve} account={vm.account} bioType={bioType} />
      <Passpad themeColor={themeColor} onCodeEntered={(c) => onApprove(c)} onCancel={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
};

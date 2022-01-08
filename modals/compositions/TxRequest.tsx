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
}

export default ({ themeColor, vm, app, onApprove, onReject }: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <RequestReview vm={vm} app={app} onReject={onReject} onApprove={onApprove} />
      <Passpad themeColor={themeColor} onCodeEntered={(c) => onApprove(c)} onCancel={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
};

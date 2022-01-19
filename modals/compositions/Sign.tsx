import React, { useEffect, useRef, useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import { Passpad } from '../views';
import SignPlainText from '../dapp/SignPlainText';
import SignTypedData from '../dapp/SignTypedData';
import Swiper from 'react-native-swiper';

interface Props {
  type: string;
  msg?: string;
  themeColor: string;
  onReject: () => void;
  onSign: () => Promise<boolean>;
  sign: (pin: string) => Promise<boolean>;
  typedData?: any;
  biometricEnabled?: boolean;
  account: Account;
}

export default ({ type, msg, themeColor, onReject, typedData, sign, biometricEnabled, onSign, account }: Props) => {
  const swiper = useRef<Swiper>(null);

  const onSignPress = async () => {
    if (!biometricEnabled) {
      swiper.current?.scrollTo(1);
      return;
    }

    if (await onSign()) return;

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
      {type === 'plaintext' ? (
        <SignPlainText msg={msg!} themeColor={themeColor} onReject={onReject} onSign={onSignPress} account={account} />
      ) : undefined}

      {type === 'typedData' ? (
        <SignTypedData data={typedData!} onReject={onReject} onSign={onSignPress} themeColor={themeColor} account={account} />
      ) : undefined}

      <Passpad themeColor={themeColor} onCodeEntered={(c) => sign(c)} onCancel={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
};

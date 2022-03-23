import React, { useEffect, useRef, useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import { BioType } from '../../viewmodels/Authentication';
import { Passpad } from '../views';
import SignPlainText from '../dapp/SignPlainText';
import SignTypedData from '../dapp/SignTypedData';
import Swiper from 'react-native-swiper';

interface Props {
  type?: 'plaintext' | 'typedData';
  msg?: string | Uint8Array;
  themeColor: string;
  onReject: () => void;
  onSign: (opt?: { pin?: string; standardMode?: boolean }) => Promise<boolean>;
  sign: (opt: { pin: string; standardMode?: boolean }) => Promise<boolean>;
  typedData?: any;
  biometricType?: BioType;
  account?: Account;
}

export default ({ type, msg, themeColor, onReject, typedData, sign, biometricType, onSign, account }: Props) => {
  const swiper = useRef<Swiper>(null);
  const [standardMode, setStandardMode] = useState<boolean>();

  const onSignPress = async () => {
    if (!biometricType) {
      swiper.current?.scrollTo(1);
      return;
    }

    if (await onSign({ standardMode })) return;

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
        <SignPlainText
          msg={msg!}
          themeColor={themeColor}
          onReject={onReject}
          onSign={onSignPress}
          account={account}
          bioType={biometricType}
          onStandardModeOn={setStandardMode}
        />
      ) : undefined}

      {type === 'typedData' ? (
        <SignTypedData
          data={typedData!}
          onReject={onReject}
          onSign={onSignPress}
          themeColor={themeColor}
          account={account}
          bioType={biometricType}
        />
      ) : undefined}

      <Passpad
        themeColor={themeColor}
        onCodeEntered={(c) => sign({ pin: c, standardMode })}
        onCancel={() => swiper.current?.scrollTo(0)}
      />
    </Swiper>
  );
};

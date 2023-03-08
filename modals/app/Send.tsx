import { ContactsPad, Passpad, ReviewPad, SendAmount } from '../views';
import React, { useEffect, useRef, useState } from 'react';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import Contacts from '../../viewmodels/customs/Contacts';
import { ReactiveScreen } from '../../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeViewContainer } from '../../components';
import Success from '../views/Success';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  vm: TokenTransferring;
  erc681?: boolean;
  close?: () => void;
  onReviewEnter?: () => void;
  onReviewLeave?: () => void;
}

export default observer(({ vm, close, erc681, onReviewEnter, onReviewLeave }: Props) => {
  const [verified, setVerified] = useState(false);
  const swiper = useRef<Swiper>(null);
  const [active] = useState({ index: 0 });

  const goTo = (index: number, animated?: boolean) => {
    swiper.current?.scrollTo(index, animated);
    index === 2 ? onReviewEnter?.() : onReviewLeave?.();
  };

  const sendTx = async (pin?: string) => {
    const result = await vm.sendTx(pin);

    if (result.success) {
      setVerified(true);
      setTimeout(() => close?.(), 1700);
    }

    return result.success;
  };

  const onSendClick = async () => {
    const selfAccount = App.allAccounts.find((c) => c.address === vm.toAddress);

    Contacts.saveContact({
      address: vm.toAddress,
      ens: vm.isEns ? vm.to : undefined,
      name: selfAccount?.nickname || vm.toAddressTag?.publicName,
      emoji: selfAccount ? { icon: selfAccount.emojiAvatar, color: selfAccount.emojiColor } : undefined,
    });

    if (!Authentication.biometricEnabled) {
      goTo(3);
      return;
    }

    if (await sendTx()) return;
    goTo(3);
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      {verified ? (
        <Success />
      ) : (
        <Swiper
          ref={swiper}
          showsPagination={false}
          showsButtons={false}
          scrollEnabled={false}
          loop={false}
          onIndexChanged={(index) => (active.index = index)}
          automaticallyAdjustContentInsets
        >
          {erc681 ? undefined : <ContactsPad onNext={() => goTo(1, true)} vm={vm} />}
          {erc681 ? undefined : (
            <SendAmount
              vm={vm}
              onBack={() => goTo(0)}
              onNext={() => {
                goTo(2);
                vm.estimateGas();
              }}
            />
          )}

          <ReviewPad
            onBack={() => goTo(1)}
            vm={vm}
            onSend={onSendClick}
            disableBack={erc681}
            biometricType={Authentication.biometricType}
            txDataEditable={vm.isNativeToken}
          />

          <SafeViewContainer>
            <Passpad themeColor={vm.network.color} onCodeEntered={sendTx} onCancel={() => goTo(2)} />
          </SafeViewContainer>
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});

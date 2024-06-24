import { ContactsPad, ReviewPad, SendAmount } from '../views';
import React, { useEffect, useRef, useState } from 'react';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import AwaitablePasspad from '../views/AwaitablePasspad';
import Contacts from '../../viewmodels/customs/Contacts';
import Packing from '../views/Packing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from '../views/Success';
import Swiper from 'react-native-swiper';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
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
  const [networkBusy, setNetworkBusy] = useState(false);
  const { biometricEnabled } = Authentication;

  const goTo = (index: number, animated?: boolean) => {
    swiper.current?.scrollTo(index, animated);
    index === 2 ? onReviewEnter?.() : onReviewLeave?.();
  };

  const sendTx = async (pin?: string) => {
    onReviewEnter?.();
    const result = await vm.sendTx(pin, () => setNetworkBusy(true));

    if (result.success) {
      setVerified(true);
      setTimeout(() => close?.(), 1700);
    } else {
      !pin && goTo(3);
    }

    onReviewLeave?.();
    return result.success;
  };

  useEffect(() => {
    erc681 && onReviewEnter?.();
  }, [erc681]);

  const onSendClick = async () => {
    const selfAccount = App.allAccounts.find((c) => c.address === vm.toAddress);

    Contacts.saveContact({
      address: vm.toAddress,
      ens: vm.isEns ? vm.to : undefined,
      name: selfAccount?.nickname || vm.toAddressTag?.publicName,
      emoji: selfAccount ? { icon: selfAccount.emojiAvatar, color: selfAccount.emojiColor } : undefined,
    });

    if (!biometricEnabled) {
      goTo(3);
      return;
    }

    await sendTx();
  };

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  return (
    <SafeAreaProvider style={{ ...styles.safeArea }}>
      {verified ? (
        <Success />
      ) : networkBusy ? (
        <Packing />
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
            txDataEditable={vm.isNativeToken}
          />

          <AwaitablePasspad themeColor={vm.network.color} onCodeEntered={sendTx} onCancel={() => goTo(erc681 ? 0 : 2)} />
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});

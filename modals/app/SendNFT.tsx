import React, { useEffect, useRef, useState } from 'react';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import AwaitablePasspad from '../views/AwaitablePasspad';
import Contacts from '../../viewmodels/customs/Contacts';
import { ContactsPad } from '../views';
import NFTReview from '../views/NFTReview';
import { NFTTransferring } from '../../viewmodels/transferring/NonFungibleTokenTransferring';
import Packing from '../views/Packing';
import Success from '../views/Success';
import Swiper from 'react-native-swiper';
import { View } from 'react-native';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';

interface Props {
  vm: NFTTransferring;
  onClose?: () => void;
}

export default observer(({ vm, onClose }: Props) => {
  const swiper = useRef<Swiper>(null);
  const [verified, setVerified] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const { biometricType, biometricEnabled } = Authentication;

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const sendTx = async (pin?: string) => {
    const result = await vm.sendTx(pin, () => setNetworkBusy(true));

    if (result.success) {
      setVerified(true);
      setTimeout(() => onClose?.(), 1700);
    } else {
      !pin && swiper.current?.scrollTo(2);
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

    if (!biometricEnabled) {
      swiper.current?.scrollTo(2);
      return;
    }

    await sendTx();
  };

  return (
    <View style={{ height: 460 }}>
      {verified ? (
        <Success />
      ) : networkBusy ? (
        <Packing />
      ) : (
        <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
          <ContactsPad
            vm={vm}
            onNext={() => {
              swiper.current?.scrollTo(1, true);
              vm.estimateGas();
            }}
          />

          <NFTReview onBack={() => swiper.current?.scrollTo(0)} vm={vm} onSend={onSendClick} />

          <AwaitablePasspad
            themeColor={vm.network.color}
            onCodeEntered={sendTx}
            onCancel={() => swiper.current?.scrollTo(1)}
          />
        </Swiper>
      )}
    </View>
  );
});

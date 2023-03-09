import { ContactsPad, Passpad } from '../views';
import React, { useEffect, useRef, useState } from 'react';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import Contacts from '../../viewmodels/customs/Contacts';
import NFTReview from '../views/NFTReview';
import { NFTTransferring } from '../../viewmodels/transferring/NonFungibleTokenTransferring';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeViewContainer } from '../../components';
import Success from '../views/Success';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  vm: NFTTransferring;
  onClose?: () => void;
}

export default observer(({ vm, onClose }: Props) => {
  const { backgroundColor } = Theme;
  const swiper = useRef<Swiper>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    return () => {
      vm.dispose();
    };
  }, []);

  const sendTx = async (pin?: string) => {
    const result = await vm.sendTx(pin);

    if (result.success) {
      setVerified(true);
      setTimeout(() => onClose?.(), 1700);
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
      swiper.current?.scrollTo(2);
      return;
    }

    if (await sendTx()) return;

    swiper.current?.scrollTo(2);
  };

  return (
    <View style={{ height: 445 }}>
      {verified ? (
        <Success />
      ) : (
        <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
          <ContactsPad
            vm={vm}
            onNext={() => {
              swiper.current?.scrollTo(1, true);
              vm.estimateGas();
            }}
          />

          <NFTReview
            onBack={() => swiper.current?.scrollTo(0)}
            vm={vm}
            onSend={onSendClick}
            biometricType={Authentication.biometricType}
          />

          <SafeViewContainer>
            <Passpad themeColor={vm.network.color} onCodeEntered={sendTx} onCancel={() => swiper.current?.scrollTo(1)} />
          </SafeViewContainer>
        </Swiper>
      )}
    </View>
  );
});

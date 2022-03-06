import { ContactsPad, Passpad, ReviewPad, SendAmount } from './views';
import React, { useEffect, useRef, useState } from 'react';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import Contacts from '../viewmodels/customs/Contacts';
import { ReactiveScreen } from '../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import Theme from '../viewmodels/settings/Theme';
import { TokenTransferring } from '../viewmodels/transferring/TokenTransferring';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';

interface Props {
  vm: TokenTransferring;
  erc681?: boolean;
  onClose?: () => void;
}

export default observer(({ vm }: Props) => {
  const { backgroundColor } = Theme;
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      <Swiper>
        <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} vm={vm} />
      </Swiper>
    </SafeAreaProvider>
  );
});

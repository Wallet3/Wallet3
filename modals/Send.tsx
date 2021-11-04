import { ContactsPad, Passpad, ReviewPad, SendAmount } from './views';
import React, { useEffect, useRef, useState } from 'react';

import Authentication from '../viewmodels/Authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { Transferring } from '../viewmodels/Transferring';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const swiper = useRef<Swiper>(null);
  const [vm] = useState(new Transferring());

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const onSend = () => {
    if (!Authentication.biometricsEnabled) {
      swiper.current?.scrollTo(3);
      return;
    }
  };

  const onPasscodeEnter = async (code: string) => {
    return await Authentication.verifyPin(code);
    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <Swiper
          ref={swiper}
          showsPagination={false}
          showsButtons={false}
          scrollEnabled={false}
          loop={false}
          automaticallyAdjustContentInsets
        >
          <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} vm={vm} />
          <SendAmount
            vm={vm}
            onBack={() => swiper.current?.scrollTo(0)}
            onNext={() => {
              swiper.current?.scrollTo(2);
              vm.estimateGas();
            }}
          />
          <ReviewPad onBack={() => swiper.current?.scrollTo(1)} vm={vm} onSend={onSend} />
          <Passpad
            themeColor={vm.currentNetwork.color}
            onCodeEntered={(c) => onPasscodeEnter(c)}
            onCancel={() => swiper.current?.scrollTo(2)}
          />
        </Swiper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

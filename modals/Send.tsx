import { ContactsPad, Passpad, ReviewPad, SendAmount } from './views';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import LottieView from 'lottie-react-native';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { Transferring } from '../viewmodels/Transferring';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(() => {
  const [vm] = useState(new Transferring({ targetNetwork: Networks.current }));
  const [verified, setVerified] = useState(false);

  const swiper = useRef<Swiper>(null);

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const sendTx = async (pin?: string) => {
    const success = await App.currentWallet!.sendTx({
      accountIndex: vm.currentAccount.index,
      tx: vm.txRequest,
      pin,
      tokenInfo: {
        symbol: vm.token.symbol,
        decimals: vm.token.decimals,
        amountWei: vm.amountWei.toString(),
        recipient: vm.toAddress,
      },
    });

    setVerified(success);

    if (success) setTimeout(() => PubSub.publish('closeSendModal'), 1700);

    return success;
  };

  const onSendClick = async () => {
    if (!Authentication.biometricsEnabled) {
      swiper.current?.scrollTo(3);
      return;
    }

    await sendTx();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {verified ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
              style={{
                width: 200,
                height: 200,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              loop={false}
              autoPlay
              source={require('../assets/animations/success.json')}
            />
          </View>
        ) : (
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
            <ReviewPad onBack={() => swiper.current?.scrollTo(1)} vm={vm} onSend={onSendClick} />
            <Passpad
              themeColor={vm.network.color}
              onCodeEntered={(c) => sendTx(c)}
              onCancel={() => swiper.current?.scrollTo(2)}
            />
          </Swiper>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import PlainTextSign from './dapp/PlainTextSign';
import { ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';
import { utils } from 'ethers';

interface Props {
  request: WCCallRequestRequest;
  client: WalletConnect_v1;
  themeColor: string;
}

export default observer(({ request, themeColor, client }: Props) => {
  const [msg, setMsg] = useState('');
  const swiper = useRef<Swiper>(null);

  useEffect(() => {
    const { params, method } = request;

    switch (method) {
      case 'eth_sign':
        setMsg(Buffer.from(utils.arrayify(params[1])).toString('utf8'));
        break;
      case 'personal_sign':
        setMsg(Buffer.from(utils.arrayify(params[0])).toString('utf8'));
        break;
    }
  }, [request]);

  const reject = () => {};
  const sign = () => {};

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
          <PlainTextSign msg={msg} themeColor={themeColor} onReject={reject} onSign={sign} />
        </Swiper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

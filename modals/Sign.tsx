import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { Authentication } from '../viewmodels/Authentication';
import { Passpad } from './views';
import PlainTextSign from './dapp/PlainTextSign';
import { ScrollView } from 'react-native-gesture-handler';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { Wallet } from '../viewmodels/Wallet';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';
import { utils } from 'ethers';

interface Props {
  request: WCCallRequestRequest;
  close: Function;
  client: WalletConnect_v1;
  themeColor: string;
  wallet: Wallet;
  appAuth: Authentication;
}

export default observer(({ request, themeColor, client, close, wallet, appAuth }: Props) => {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('');
  const [verified, setVerified] = useState(false);

  const swiper = useRef<Swiper>(null);

  useEffect(() => {
    const { params, method } = request;

    switch (method) {
      case 'eth_sign':
        setMsg(Buffer.from(utils.arrayify(params[1])).toString('utf8'));
        setType('plaintext');
        break;
      case 'personal_sign':
        setMsg(Buffer.from(utils.arrayify(params[0])).toString('utf8'));
        setType('plaintext');
        break;
    }
  }, [request]);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sign = async (pin?: string) => {
    const signed = await wallet.signMessage({ msg, pin });

    if (signed) {
      client.approveRequest(request.id, signed);
      setVerified(true);
      (reject as any) = undefined;
      setTimeout(() => close(), 1750);
    }

    return signed ? true : false;
  };

  const onSignPress = async () => {
    if (!appAuth.biometricsEnabled) {
      swiper.current?.scrollTo(1);
      return;
    }

    if (await sign()) return;

    swiper.current?.scrollTo(1);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {verified ? (
          <Success />
        ) : (
          <Swiper
            ref={swiper}
            showsPagination={false}
            showsButtons={false}
            scrollEnabled={false}
            loop={false}
            automaticallyAdjustContentInsets
          >
            {type === 'plaintext' ? (
              <PlainTextSign msg={msg} themeColor={themeColor} onReject={reject} onSign={onSignPress} />
            ) : (
              <View />
            )}

            <Passpad themeColor={themeColor} onCodeEntered={(c) => sign(c)} onCancel={() => swiper.current?.scrollTo(0)} />
          </Swiper>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

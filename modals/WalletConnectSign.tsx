import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { Authentication } from '../viewmodels/Authentication';
import Networks from '../viewmodels/Networks';
import { Passpad } from './views';
import PlainTextSign from './dapp/SignPlainText';
import { PublicNetworks } from '../common/Networks';
import SignTypedData from './dapp/SignTypedData';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { Wallet } from '../viewmodels/Wallet';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';
import { utils } from 'ethers';

interface Props {
  request: WCCallRequestRequest;
  close: Function;
  client: WalletConnect_v1;
  wallet: Wallet;
  appAuth: Authentication;
}

export default observer(({ request, client, close, wallet, appAuth }: Props) => {
  const [msg, setMsg] = useState<string>();
  const [typedData, setTypedData] = useState();
  const [type, setType] = useState('');
  const [verified, setVerified] = useState(false);

  const themeColor = client.findTargetNetwork({ networks: PublicNetworks, defaultNetwork: Networks.current }).color;

  const swiper = useRef<Swiper>(null);

  useEffect(() => {
    const { params, method } = request;
    setMsg(undefined);
    setTypedData(undefined);

    try {
      switch (method) {
        case 'eth_sign':
          setMsg(Buffer.from(utils.arrayify(params[1])).toString('utf8'));
          setType('plaintext');
          break;
        case 'personal_sign':
          setMsg(Buffer.from(utils.arrayify(params[0])).toString('utf8'));
          setType('plaintext');
          break;
        case 'eth_signTypedData':
          setTypedData(JSON.parse(params[1]));
          setType('typedData');
          break;
      }
    } catch (error) {
      close();
    }
  }, [request]);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sign = async (pin?: string) => {
    const signed = typedData ? await wallet.signTypedData({ typedData, pin }) : await wallet.signMessage({ msg: msg!, pin });

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
    <SafeAreaProvider style={styles.safeArea}>
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
            <PlainTextSign msg={msg!} themeColor={themeColor} onReject={reject} onSign={onSignPress} />
          ) : undefined}

          {type === 'typedData' ? (
            <SignTypedData data={typedData!} onReject={reject} onSign={onSignPress} themeColor={themeColor} />
          ) : undefined}

          <Passpad themeColor={themeColor} onCodeEntered={(c) => sign(c)} onCancel={() => swiper.current?.scrollTo(0)} />
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});

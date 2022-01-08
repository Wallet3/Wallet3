import { INetwork, PublicNetworks } from '../common/Networks';
import React, { useEffect, useRef, useState } from 'react';
import { TransactionRequest, parseRequestType } from '../viewmodels/transferring/TransactionRequest';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../models/WCSession_v1';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import { Passpad } from './views';
import RequestReview from './dapp/RequestReview';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';

interface Props {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
  close: Function;
}

export default observer(({ client, request, close }: Props) => {
  const swiper = useRef<Swiper>(null);

  const [vm] = useState(new TransactionRequest({ client, request }));
  const [type] = useState(parseRequestType(request.params[0]?.data).type);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sendTx = async (pin?: string) => {
    const tx = vm.txRequest;

    const { txHex, error } = await App.currentWallet!.signTx({
      accountIndex: vm.account.index,
      tx,
      pin,
    });

    if (!txHex || error) {
      client.rejectRequest(request.id, error || '');
      if (error) showMessage({ message: error, type: 'warning' });
      close();
      return false;
    }

    const hash = await App.currentWallet!.sendTx({
      txHex,
      tx,
      readableInfo: {
        type: 'dapp-interaction',
        dapp: vm.appMeta.name,
        icon: vm.appMeta.icons[0],
      },
    });

    setVerified(true);
    client.approveRequest(request.id, hash);
    setTimeout(() => close(), 1700);

    return true;
  };

  const onSendClick = async () => {
    if (!Authentication.biometricsEnabled) {
      swiper.current?.scrollTo(1);
      return;
    }

    if (await sendTx()) return;
    swiper.current?.scrollTo(1);
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, height: type !== 'Contract Interaction' ? 500 : 439 }}>
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
          <RequestReview vm={vm} onReject={reject} onApprove={onSendClick} />
          <Passpad
            themeColor={vm.network.color}
            onCodeEntered={(c) => sendTx(c)}
            onCancel={() => swiper.current?.scrollTo(0)}
          />
        </Swiper>
      )}
    </SafeAreaProvider>
  );
});

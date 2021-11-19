import { INetwork, PublicNetworks } from '../common/Networks';
import React, { useEffect, useRef, useState } from 'react';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../models/WCSession_v1';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import { Passpad } from './views';
import RequestReview from './dapp/RequestReview';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Success from './views/Success';
import Swiper from 'react-native-swiper';
import { TransactionRequest } from '../viewmodels/TransactionRequest';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
  close: Function;
}

export default observer(({ client, request, close }: Props) => {
  const swiper = useRef<Swiper>(null);

  const [vm] = useState(new TransactionRequest({ client, request }));
  const [verified, setVerified] = useState(false);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sendTx = async (pin?: string) => {
    const { success, txHex } = await App.currentWallet!.sendTx({
      accountIndex: vm.account.index,
      tx: vm.txRequest,
      pin,

      readableInfo: {
        type: 'dapp-interaction',
        dapp: vm.appMeta.name,
        icon: vm.appMeta.icons[0],
      },
    });

    setVerified(success);

    if (success) setTimeout(() => close(), 1700);
    client.approveRequest(request.id, txHex);

    return success;
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
    <SafeAreaProvider style={{ ...styles.safeArea, height: 500 }}>
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

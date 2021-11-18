import { INetwork, PublicNetworks } from '../common/Networks';
import React, { useEffect, useRef, useState } from 'react';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../models/WCSession_v1';

import App from '../viewmodels/App';
import { Passpad } from './views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import { TransactionRequest } from '../viewmodels/TransactionRequest';
import TxReview from './dapp/TxReview';
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
    return true;
    // const success = await App.currentWallet!.sendTx({
    //   accountIndex: vm.currentAccount.index,
    //   tx: vm.txRequest,
    //   pin,

    //   readableInfo: {
    //     type: 'transfer',
    //     symbol: vm.token.symbol,
    //     decimals: vm.token.decimals,
    //     amountWei: vm.amountWei.toString(),
    //     amount: Number(vm.amount).toLocaleString(undefined, { maximumFractionDigits: 7 }),
    //     recipient: vm.to || vm.toAddress,
    //   },
    // });

    // setVerified(success);

    // if (success) setTimeout(() => PubSub.publish('closeSendModal'), 1700);

    // return success;
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <TxReview vm={vm} onReject={reject} />
        <Passpad themeColor={vm.network.color} onCodeEntered={(c) => sendTx(c)} onCancel={() => swiper.current?.scrollTo(0)} />
      </Swiper>
    </SafeAreaProvider>
  );
});

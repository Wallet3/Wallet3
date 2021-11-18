import React, { useEffect, useRef, useState } from 'react';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../models/WCSession_v1';

import App from '../viewmodels/App';
import { INetwork } from '../common/Networks';
import { Passpad } from './views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import TxReview from './dapp/TxReview';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
  currentNetwork?: INetwork;
  close: Function;
}

export default observer(({ client, request, currentNetwork, close }: Props) => {
  const swiper = useRef<Swiper>(null);
  const [network, setNetwork] = useState<INetwork>();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const [param, requestChainId] = request.params as [WCCallRequest_eth_sendTransaction, number?]; 
    setNetwork(currentNetwork);
  }, []);

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
        <TxReview client={client} request={request} network={network} onReject={reject} />
        <Passpad themeColor={network?.color} onCodeEntered={(c) => sendTx(c)} onCancel={() => swiper.current?.scrollTo(0)} />
      </Swiper>
    </SafeAreaProvider>
  );
});

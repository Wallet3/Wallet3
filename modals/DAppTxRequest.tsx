import { INetwork } from '../common/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import TxRequest from './dapp/TxRequest';
import { WCCallRequestRequest } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
  network?: INetwork;
  close: Function;
}

export default observer(({ client, request, network, close }: Props) => {
  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <TxRequest client={client} request={request} network={network} onReject={reject} />
    </SafeAreaProvider>
  );
});

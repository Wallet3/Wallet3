import React, { useEffect, useState } from 'react';

import Authentication from '../viewmodels/auth/Authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from './views/Success';
import Theme from '../viewmodels/settings/Theme';
import TxRequest from './compositions/TxRequest';
import { WCCallRequestRequest } from '../models/entities/WCSession_v1';
import { WalletConnectTransactionRequest } from '../viewmodels/transferring/WalletConnectTransactionRequest';
import { WalletConnect_v1 } from '../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../viewmodels/walletconnect/WalletConnect_v2';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  client: WalletConnect_v1 | WalletConnect_v2;
  request: WCCallRequestRequest;
  chainId?: number;
  close: Function;
}

export default observer(({ client, request, close, chainId }: Props) => {
  const [vm] = useState(new WalletConnectTransactionRequest({ client, request, chainId }));
  const [verified, setVerified] = useState(false);
  const { backgroundColor } = Theme;

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const reject = () => {
    client.rejectRequest(request.id, 'User rejected');
    close();
  };

  const sendTx = async (pin?: string) => {
    const result = await vm.sendTx(pin);

    if (result.success) {
      setVerified(true);
      client.approveRequest(request.id, result.tx?.hash || '');
      setTimeout(() => close(), 1700);
    }

    return result.success;
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, height: 520, backgroundColor }}>
      {verified ? (
        <Success />
      ) : (
        <TxRequest
          themeColor={vm.network.color}
          app={vm.appMeta}
          vm={vm}
          onApprove={sendTx}
          onReject={reject}
          bioType={Authentication.biometricType}
        />
      )}
    </SafeAreaProvider>
  );
});

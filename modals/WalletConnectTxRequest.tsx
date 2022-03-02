import React, { useEffect, useState } from 'react';
import { WalletConnectTransactionRequest, parseRequestType } from '../viewmodels/transferring/WalletConnectTransactionRequest';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from './views/Success';
import Theme from '../viewmodels/settings/Theme';
import TxRequest from './compositions/TxRequest';
import { WCCallRequestRequest } from '../models/WCSession_v1';
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
  const [vm] = useState(new WalletConnectTransactionRequest({ client, request }));
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
    const tx = vm.txRequest;

    const { txHex, error } = await vm.wallet.signTx({
      accountIndex: vm.account.index,
      tx,
      pin,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return false;
    }

    const hash = await vm.wallet.sendTx({
      txHex,
      tx,
      readableInfo: {
        type: 'dapp-interaction',
        dapp: vm.appMeta.name,
        icon: vm.appMeta.icon,
      },
    });

    setVerified(true);
    client.approveRequest(request.id, hash);
    setTimeout(() => close(), 1700);

    return true;
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

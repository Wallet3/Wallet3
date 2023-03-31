import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import { InpageDAppTxRequest } from '../../screens/browser/controller/InpageDAppController';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/core/Networks';
import Packing from '../views/Packing';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';
import { ReadableInfo } from '../../models/entities/Transaction';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from '../views/Success';
import Theme from '../../viewmodels/settings/Theme';
import TxRequest from '../compositions/TxRequest';
import { decodeCallToReadable } from '../../viewmodels/services/DecodeFuncCall';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from '../styles';

interface Props extends InpageDAppTxRequest {
  close: () => void;
}

export default observer(({ approve, reject, close, app, vm }: Props) => {
  const [verified, setVerified] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const { biometricType } = Authentication;

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const onReject = () => {
    reject();
    close();
  };

  const onApprove = async (pin?: string) => {
    const tx = vm.txRequest;
    const readableInfo: ReadableInfo = {
      dapp: app.name,
      icon: app.icon,
      type: 'dapp-interaction',
      decodedFunc: vm.decodedFunc?.fullFunc,
      symbol: vm.erc20?.symbol,
      amount: Number(vm.tokenAmount).toString(),
      recipient: vm.to,
    };

    const result = await approve({
      pin,
      tx,
      onNetworkRequest: () => setNetworkBusy(true),
      readableInfo: {
        ...readableInfo,
        readableTxt: decodeCallToReadable(tx!, { network: vm.network, readableInfo }),
      },
    });

    setVerified(result);

    if (result) {
      setTimeout(() => close(), 1750);
    }

    return result;
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, height: 500 }}>
      {verified ? (
        <Success />
      ) : networkBusy ? (
        <Packing />
      ) : (
        <TxRequest vm={vm} app={app} bioType={biometricType} onApprove={onApprove} onReject={onReject} />
      )}
    </SafeAreaProvider>
  );
});

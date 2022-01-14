import React, { useState } from 'react';

import App from '../viewmodels/App';
import Authentication from '../viewmodels/Authentication';
import { Button } from '../components';
import { InpageDAppTxRequest } from '../viewmodels/hubs/InpageMetamaskDAppHub';
import Networks from '../viewmodels/Networks';
import { RawTransactionRequest } from '../viewmodels/transferring/RawTransactionRequest';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Success from './views/Success';
import TxRequest from './compositions/TxRequest';
import { View } from 'react-native';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props extends InpageDAppTxRequest {
  close: () => void;
}

export default observer(({ param, chainId, approve, reject, close, account, app }: Props) => {
  const [verified, setVerified] = useState(false);
  const [network] = useState(Networks.find(chainId) ?? Networks.Ethereum);
  const [userAccount] = useState(App.findAccount(account));
  const { t } = i18n;

  const onReject = () => {
    reject();
    close();
  };

  if (!userAccount) {
    return (
      <SafeAreaProvider>
        <View>
          <View></View>
          <Button title={t('button-cancel')} onPress={onReject} />
        </View>
      </SafeAreaProvider>
    );
  }

  const [vm] = useState(new RawTransactionRequest({ param, network, account: userAccount }));

  const onApprove = async (pin?: string) => {
    const result = await approve({ pin, tx: vm.txRequest });
    setVerified(result);
    if (result) setTimeout(() => close(), 1750);
    return result;
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, height: 480 }}>
      {verified ? (
        <Success />
      ) : (
        <TxRequest
          vm={vm}
          themeColor={network.color}
          biometricEnabled={Authentication.biometricsEnabled}
          onApprove={onApprove}
          onReject={onReject}
          app={app}
        />
      )}
    </SafeAreaProvider>
  );
});

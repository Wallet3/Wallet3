import App from '../viewmodels/App';
import DAppConnectView from './dapp/DAppConnectView';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  close: () => void;
  resolve?: (accounts: string[]) => void;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appUrl?: string;
}

export default observer(({ resolve, close, appName, appDesc, appIcon, appUrl }: Props) => {
  const onConnect = () => {
    resolve?.([App.currentWallet?.currentAccount?.address ?? '']);
    close();
  };

  const onReject = () => {
    resolve?.([]);
    close();
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <DAppConnectView
        network={Networks.current}
        account={App.currentWallet?.currentAccount!}
        onConnect={onConnect}
        onReject={onReject}
        appName={appName}
        appDesc={appDesc}
        appIcon={appIcon}
        appUrl={appUrl}
        disableNetworksButton
      />
    </SafeAreaProvider>
  );
});

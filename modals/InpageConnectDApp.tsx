import App from '../viewmodels/App';
import DAppConnectView from './dapp/DAppConnectView';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  close: () => void;
  approve?: () => void;
  reject?: () => void;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appUrl?: string;
}

export default observer(({ approve, reject, close, appName, appDesc, appIcon, appUrl }: Props) => {
  const onConnect = () => {
    approve?.();
    close();
  };

  const onReject = () => {
    reject?.();
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

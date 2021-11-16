import React, { useEffect, useState } from 'react';

// import DAppHub from '../viewmodels/DAppHub';
import Loading from './views/Loading';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import { SafeViewContainer } from '../components';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  uri?: string;
}

export default observer(({ uri }: Props) => {
  const [connecting, setConnecting] = useState(true);
  console.log('ConnectDapp');

  useEffect(() => {
    // DAppHub.on('newClient', ({ client }: { client: WalletConnect_v1 }) => {
    //   setConnecting(true);
    //   client.once('sessionRequest', () => {
    //     setConnecting(false);
    //   });
    // });
  }, [uri]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>{connecting ? <Loading /> : undefined}</SafeAreaView>
    </SafeAreaProvider>
  );
});

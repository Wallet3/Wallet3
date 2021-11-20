import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import App from '../viewmodels/App';
import DApp from './dapp/DApp';
import DAppHub from '../viewmodels/DAppHub';
import { Ionicons } from '@expo/vector-icons';
import Loading from './views/Loading';
import NetworkSelector from './dapp/NetworkSelector';
import { PublicNetworks } from '../common/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  uri?: string;
  close: Function;
}

const ConnectDApp = observer(({ client, close }: { client: WalletConnect_v1; close: Function }) => {
  const swiper = useRef<Swiper>(null);

  const selectNetworks = (chains: number[]) => {
    swiper.current?.scrollTo(0);
    client.setChains(chains);
  };

  const selectAccounts = (accounts: string[]) => {
    swiper.current?.scrollTo(0);
    client.setAccounts(accounts);
  };

  const connect = () => {
    client.approveSession();
    close();
  };

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <DApp client={client} close={close} onNetworksPress={() => swiper.current?.scrollTo(1)} onConnect={connect} />
      <NetworkSelector networks={PublicNetworks} selectedChains={client.enabledChains} onDone={selectNetworks} />
    </Swiper>
  );
});

const TimeoutView = ({ close }: { close: Function }) => {
  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="timer-outline" color="crimson" size={72} />
        <Text style={{ fontSize: 24, color: 'crimson', marginTop: 12 }}>Connection Timeout</Text>
        <Text style={{ fontSize: 17, color: 'crimson', marginTop: 12 }}>Please refresh webpage and try again.</Text>
      </View>
      <Button title="Close" onPress={() => close()} />
    </SafeViewContainer>
  );
};

export default observer(({ uri, close }: Props) => {
  const [connecting, setConnecting] = useState(true);
  const [connectTimeout, setConnectTimeout] = useState(false);
  const [client, setClient] = useState<WalletConnect_v1>();

  useEffect(() => {
    if (!uri) return;
    if (client) return;
    console.log('Connecting DApp');

    let wc_client = DAppHub.connect(uri);
    const timeout = setTimeout(async () => {
      console.log('timeout');
      setConnectTimeout(true);
      setConnecting(false);
      setClient(undefined);
      await wc_client?.killSession();
      wc_client?.dispose();
      wc_client = undefined;
    }, 15 * 1000);

    wc_client?.once('sessionRequest', () => {
      clearTimeout(timeout);
      setConnecting(false);
      setClient(wc_client!);
    });
  }, [uri]);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {connecting ? <Loading /> : undefined}
      {client ? <ConnectDApp client={client} close={close} /> : undefined}
      {connectTimeout ? <TimeoutView close={close} /> : undefined}
    </SafeAreaProvider>
  );
});

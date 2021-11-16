import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Button, SafeViewContainer } from '../components';
import { INetwork, Networks } from '../common/Networks';
import { NetworkIcons, generateNetworkIcon } from '../assets/icons/networks/color';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor, thirdFontColor } from '../constants/styles';

import DAppHub from '../viewmodels/DAppHub';
import Image from 'react-native-expo-cached-image';
import Loading from './views/Loading';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { WCClientMeta } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  uri?: string;
  close: Function;
}

interface DAppProps {
  client: WalletConnect_v1;
  onNetworksPress?: () => void;
  close: Function;
}

const DApp = observer(({ client, onNetworksPress, close }: DAppProps) => {
  const networks = Networks.filter((n) => client.enabledChains.includes(n.chainId));
  const [network] = networks;
  const app = client.appMeta!;

  const reject = async () => {
    close();
    await client.killSession();
    client.dispose();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
        <TouchableOpacity
          onPress={onNetworksPress}
          style={{
            padding: 6,
            paddingHorizontal: 12,
            borderColor,
            borderWidth: 1,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({ chainId: network.chainId, width: 16, height: 16 })}
          <Text style={{ color: network.color, marginStart: 8 }}>{network.network}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Image source={{ uri: app.icons[0] }} style={{ width: 72, height: 72, marginBottom: 12 }} />

      <Text style={{ ...viewStyles.txt, fontSize: 24, fontWeight: '500', opacity: 1 }}>{app.name}</Text>

      <Text style={viewStyles.txt} numberOfLines={1}>
        {app.url}
      </Text>

      {app.description ? (
        <Text style={viewStyles.txt} numberOfLines={2}>
          {app.description}
        </Text>
      ) : undefined}

      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <Button title="Connect" />

        <Button
          title="Reject"
          txtStyle={{ color: themeColor }}
          themeColor="transparent"
          style={{ marginTop: 12, borderColor: themeColor, borderWidth: 1 }}
          onPress={reject}
        />
      </View>
    </View>
  );
});

const ConnectDApp = observer(({ client, close }: { client: WalletConnect_v1; close: Function }) => {
  const swiper = useRef<Swiper>(null);

  return (
    <SafeViewContainer style={{ flex: 1 }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <DApp client={client} close={close} />
      </Swiper>
    </SafeViewContainer>
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
    console.log('Connecting DApp');
    if (!uri) return;
    if (client) return;

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {connecting ? <Loading /> : undefined}
        {client ? <ConnectDApp client={client} close={close} /> : undefined}
        {connectTimeout ? <TimeoutView close={close} /> : undefined}
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    opacity: 0.75,
    fontSize: 17,
    maxWidth: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
});

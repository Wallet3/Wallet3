import { Button, SafeViewContainer } from '../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { themeColor, thirdFontColor } from '../constants/styles';

import { AntDesign } from '@expo/vector-icons';
import DAppHub from '../viewmodels/DAppHub';
import Image from 'react-native-expo-cached-image';
import Loading from './views/Loading';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { WCClientMeta } from '../models/WCSession_v1';
import { WalletConnect_v1 } from '../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  uri?: string;
}

const DApp = observer(({ app }: { app: WCClientMeta }) => {
  return (
    <SafeViewContainer style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
        <TouchableOpacity style={{ paddingStart: 12 }}>
          <AntDesign name="close" size={24} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Image source={{ uri: app.icons[0] }} style={{ width: 72, height: 72, borderRadius: 100, marginBottom: 8 }} />

      <Text style={viewStyles.txt}>{app.name}</Text>
      {app.description ? (
        <Text style={viewStyles.txt} numberOfLines={2}>
          {app.description}
        </Text>
      ) : undefined}
      <Text style={viewStyles.txt} numberOfLines={1}>
        {app.url}
      </Text>

      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <Button
          title="Reject"
          txtStyle={{ color: themeColor }}
          themeColor="transparent"
          style={{ marginBottom: 12, borderColor: themeColor, borderWidth: 1 }}
        />
        <Button title="Connect" />
      </View>
    </SafeViewContainer>
  );
});

export default observer(({ uri }: Props) => {
  const [connecting, setConnecting] = useState(true);
  const [connectTimeout, setConnectTimeout] = useState(false);
  const [appMeta, setAppMeta] = useState<WCClientMeta>();

  useEffect(() => {
    console.log('Connecting DApp');
    if (!uri) return;

    const client = DAppHub.connect(uri);
    const timeout = setTimeout(async () => {
      setConnectTimeout(true);
      await client?.killSession();
      client?.dispose();
    }, 30 * 1000);

    client?.once('sessionRequest', () => {
      clearTimeout(timeout);
      setConnecting(false);
      setAppMeta(client.appMeta!);
    });
  }, [uri]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {connecting ? <Loading /> : undefined}
        {appMeta ? <DApp app={appMeta} /> : undefined}
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    fontSize: 17,
    maxWidth: '85%',
    marginBottom: 8,
  },
});

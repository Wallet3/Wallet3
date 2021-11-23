import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PubSub from 'pubsub-js';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import { openSettings } from 'expo-linking';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    const supportedSchemes = ['ethereum', 'wc:', '0x'];
    const scheme =
      supportedSchemes.find((schema) => data.toLowerCase().startsWith(schema)) || (data.endsWith('.eth') ? '0x' : undefined);
    if (!scheme) return;

    PubSub.publish(`CodeScan-${scheme}`, { data });
    setScanned(true);
    navigation.pop();
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      setScanned(true);
    };
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={{ ...styles.container, backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>No access to camera</Text>
        <Button title="Go to Settings" style={{ marginVertical: 12, paddingHorizontal: 12 }} onPress={() => openSettings()} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
      />

      <StatusBar style="light" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
});

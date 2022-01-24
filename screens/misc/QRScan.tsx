import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BarCodeScannedCallback } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Scanner from '../../components/Scanner';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    const handled = LinkHub.handleURL(data);
    setScanned(handled || false);

    if (handled) navigation.pop();
  };

  return (
    <View style={styles.container}>
      <Scanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
      />

      <Ionicons name="scan-outline" size={250} color="#ffffff50" style={{ position: 'absolute', zIndex: 1 }} />

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

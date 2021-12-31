import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openSettings } from 'expo-linking';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { t } = i18n;

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    const handled = LinkHub.handleURL(data);
    setScanned(handled || false);

    if (handled) navigation.pop();
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
        <Text style={{ color: '#fff' }}>{t('qrscan-no-permission')}</Text>
        <Button
          title={t('qrscan-go-to-settings')}
          style={{ marginVertical: 12, paddingHorizontal: 12 }}
          onPress={() => openSettings()}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
      >
        
      </BarCodeScanner>

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

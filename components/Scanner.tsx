import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import Button from './Button';
import { StatusBar } from 'expo-status-bar';
import i18n from '../i18n';
import { openSettings } from 'expo-linking';

interface Props {
  onBarCodeScanned?: BarCodeScannedCallback;
  style?: StyleProp<ViewStyle>;
}

export default ({ onBarCodeScanned }: Props) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { t } = i18n;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
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
    <BarCodeScanner
      onBarCodeScanned={onBarCodeScanned}
      style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
    ></BarCodeScanner>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
});

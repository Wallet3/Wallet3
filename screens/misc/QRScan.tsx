import React, { useState } from 'react';
import Scanner, { BarCodeScanningResult } from '../../components/Scanner';
import { StyleSheet, Text, View } from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import Authentication from '../../viewmodels/Authentication';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation, route }: NativeStackScreenProps<{}, never>) => {
  const [scanned, setScanned] = useState(false);
  const { t } = i18n;

  const { tip } = (route.params || {}) as { tip?: string };

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
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

      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <AntDesign name="qrcode" size={29} color={'#fff'} />

        <View>
          <Text style={styles.tip} numberOfLines={1}>
            {Authentication.appAuthorized ? tip || t('qrscan-tip-1') : t('qrscan-tip-desktop-backup-qrcode')}
          </Text>
          <Text style={{ ...styles.tip, fontSize: 9 }}>{t('qrscan-tip-above-types')}</Text>
        </View>
      </View>

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

  tip: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginStart: 8,
  },
});

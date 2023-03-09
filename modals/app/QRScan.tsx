import Scanner, { BarCodeScanningResult } from '../../components/Scanner';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import Authentication from '../../viewmodels/auth/Authentication';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import React from 'react';
import { ReactiveScreen } from '../../utils/device';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { logQRScanned } from '../../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  tip?: string;
  close?: () => void;
  handler?: (params: BarCodeScanningResult) => void;
  style?: StyleProp<ViewStyle>;
}

export default observer(({ tip, close, handler, style }: Props) => {
  const { t } = i18n;
  const { top } = useSafeAreaInsets();

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    const handled = LinkHub.handleURL(data);

    if (handled) {
      logQRScanned(data);
      close?.();
    }
  };

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: ReactiveScreen.width,
        height: ReactiveScreen.height,
        ...(style as any),
      }}
    >
      <Scanner
        onBarCodeScanned={handler ?? handleBarCodeScanned}
        style={{ flex: 1, width: ReactiveScreen.width, height: ReactiveScreen.height, position: 'absolute' }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 18,
          right: 18,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <AntDesign name="qrcode" size={29} color={'#fff'} />

        <View>
          <Text style={styles.tip} numberOfLines={1}>
            {tip || t('qrscan-tip-1')}
          </Text>
          <Text style={{ ...styles.tip, fontSize: 9 }}>{t('qrscan-tip-above-types')}</Text>
        </View>
      </View>

      <TouchableOpacity style={{ padding: 8, position: 'absolute', top: top + 4, left: 8 }} onPress={close}>
        <AntDesign name="close" color="#fff" size={22} />
      </TouchableOpacity>

      <StatusBar style="light" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},

  tip: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginStart: 8,
  },
});

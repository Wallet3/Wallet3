import { Text, View } from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { BarCodeScannedCallback } from 'expo-barcode-scanner';
import { BarCodeScanningResult } from 'expo-camera';
import React from 'react';
import Scanner from '../../components/Scanner';
import { decode } from 'js-base64';
import i18n from '../../i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onBack?: () => void;
  enabled?: boolean;
  onBarCodeScanned?: (scanningResult: BarCodeScanningResult) => void;
  tipText?: string;
}

export default ({ onBack, enabled, onBarCodeScanned, tipText }: Props) => {
  const { bottom } = useSafeAreaInsets();
  const { t } = i18n;

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
      {enabled ? (
        <Scanner
          onBarCodeScanned={onBarCodeScanned}
          style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        />
      ) : undefined}

      <View style={{ padding: 16, position: 'absolute' }}>
        <BackButton onPress={onBack} color={'#fff'} />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: bottom || 8,
          left: 17,
          right: 16,
          height: 32,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <AntDesign name="qrcode" size={29} color={'#fff'} />
        <View style={{ marginStart: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }} numberOfLines={1}>
            {tipText}
          </Text>
          <Text style={{ color: '#fff', fontWeight: '500', fontSize: 9 }}>{t('qrscan-tip-above-types')}</Text>
        </View>
      </View>
    </View>
  );
};

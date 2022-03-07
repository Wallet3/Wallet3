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
        <AntDesign name="qrcode" size={27} color={'#fff'} />
        <Text
          style={{ color: '#fff', marginHorizontal: 8, fontWeight: '500', maxHeight: '50%', fontSize: 14 }}
          numberOfLines={2}
        >
          {tipText}
        </Text>
      </View>
    </View>
  );
};

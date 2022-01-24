import BackButton from '../components/BackButton';
import { BarCodeScannedCallback } from 'expo-barcode-scanner';
import React from 'react';
import Scanner from '../../components/Scanner';
import { View } from 'react-native';
import { decode } from 'js-base64';

interface Props {
  onBack?: () => void;
  enabled?: boolean;
  onData?: (data: string) => void;
}
export default ({ onBack, enabled, onData }: Props) => {
  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    if (data.startsWith('wallet3sync:')) {
      const encoded = data.substring(12);
      const decoded = decode(encoded).replaceAll(',', ' ').trim();
      onData?.(decoded);
      return;
    }

    onData?.(data);
  };

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
      {enabled ? (
        <Scanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        />
      ) : undefined}

      <View style={{ padding: 16 }}>
        <BackButton onPress={onBack} color={'#fff'} />
      </View>
    </View>
  );
};

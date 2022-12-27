import Scanner, { BarCodeScanningResult } from '../../components/Scanner';
import { Text, View } from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { BarCodeScannedCallback } from 'expo-barcode-scanner';
import MiniScanner from '../views/MiniScanner';
import React from 'react';
import { decode } from 'js-base64';
import i18n from '../../i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onBack?: () => void;
  enabled?: boolean;
  onData?: (data: string) => void;
}

export default ({ onBack, enabled, onData }: Props) => {
  const { t } = i18n;

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (data.startsWith('wallet3sync:')) {
      const encoded = data.substring(12);
      const decoded = decode(encoded).replaceAll(',', ' ').trim();
      onData?.(decoded);
      return;
    }

    onData?.(data);
  };

  return <MiniScanner tipText={t('qrscan-tip-2')} onBarCodeScanned={handleBarCodeScanned} onBack={onBack} enabled={enabled} />;
};

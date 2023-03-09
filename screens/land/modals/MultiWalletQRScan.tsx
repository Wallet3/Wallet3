import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { BarCodeScanningResult } from '../../../components/Scanner';
import { KeyRecovery } from '../../../viewmodels/tss/KeyRecovery';
import LottieView from 'lottie-react-native';
import { QRScan } from '../../../modals';
import { ReactiveScreen } from '../../../utils/device';
import { ZoomInView } from '../../../components/animations';
import { observer } from 'mobx-react-lite';
import { t } from 'i18n-js';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verifiedColor } from '../../../constants/styles';

export default observer(({ close, onBusy }: { close: () => void; onBusy: (busy: boolean) => void }) => {
  const { top } = useSafeAreaInsets();
  const [added, setAdded] = useState(false);
  const [aggregator] = useState(new KeyRecovery());

  const navigation = useNavigation<any>();
  const { width: screenWidth, height: screenHeight } = ReactiveScreen;

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (!aggregator.add(data)) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  useEffect(() => {
    aggregator.once('combined', async (mnemonic) => {
      onBusy(true);
      await aggregator.save(mnemonic);
      onBusy(false);
      close();

      setTimeout(() => navigation.navigate('SetupPasscode'), 125);
    });

    return () => {
      aggregator.clear();
      aggregator.removeAllListeners();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <QRScan
        tip={t('qrscan-tip-paired-devices-qrcode')}
        handler={handleBarCodeScanned}
        close={close}
        style={{ position: 'absolute' }}
      />

      {added && (
        <ZoomInView
          style={{
            position: 'absolute',
            left: (screenWidth - 250) / 2,
            top: (screenHeight - 250) / 2,
          }}
        >
          <LottieView
            autoPlay
            loop={false}
            style={{ width: 250, height: 250 }}
            source={require('../../../assets/animations/check-verde.json')}
          />
        </ZoomInView>
      )}

      <View
        style={{
          position: 'absolute',
          right: 16,
          top: top + 9,
          backgroundColor: `${verifiedColor}c0`,
          borderRadius: 15,
          paddingHorizontal: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 3,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          {`${aggregator.count} / ${aggregator.threshold || 'N'}`}
        </Text>
      </View>
    </View>
  );
});

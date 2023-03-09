import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import Button from '../components/Button';
import Device from '../../../components/Device';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import React from 'react';
import { Service } from 'react-native-zeroconf';
import Theme from '../../../viewmodels/settings/Theme';
import Welcome from '../components/Introduction';
import { formatAddress } from '../../../utils/formatter';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext, device }: { device: PairedDevice; onNext: () => void }) => {
  const { t } = i18n;
  const { secondaryTextColor } = Theme;
  const marginHorizontal = useHorizontalPadding();

  return (
    <View style={{ flex: 1 }} entering={FadeInDown.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <View style={{ flex: 1, marginHorizontal, justifyContent: 'center', alignItems: 'center' }}>
        <Device deviceId={device.deviceInfo.device} os={device.deviceInfo.rn_os} style={{ width: 150, height: 150 }} />
        <Text style={{ color: secondaryTextColor, marginTop: 12 }}>
          {`${device.deviceInfo.os} ${device.deviceInfo.osVersion}`}
        </Text>
        <Text style={{ marginTop: 8, color: secondaryTextColor }}>{formatAddress(device.secretsInfo.mainAddress, 7, 5)}</Text>
      </View>

      <Button title={t('button-next')} onPress={onNext} />
    </View>
  );
});

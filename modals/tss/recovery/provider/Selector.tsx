import { FlatList, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
import { FadeInDownView } from '../../../../components/animations';
import { Feather } from '@expo/vector-icons';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../../viewmodels/tss/management/PairedDevices';
import { ReactiveScreen } from '../../../../utils/device';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { useHorizontalPadding } from '../../components/Utils';
import { verifiedColor } from '../../../../constants/styles';

interface Props {
  onNext: (selected: PairedDevice) => void;
}

export default ({ onNext }: Props) => {
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice>();
  const { t } = i18n;
  const { secondaryTextColor } = Theme;

  const marginHorizontal = useHorizontalPadding();

  const renderItem = ({ item }: { item: PairedDevice }) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedDevice(item)}
        style={{ paddingHorizontal: marginHorizontal, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
      >
        <DeviceInfo info={item.deviceInfo} mainAddress={item.secretsInfo.mainAddress} />
        {selectedDevice?.id === item.id && (
          <Feather name="check" size={24} color={verifiedColor} style={{ marginStart: 12 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FadeInDownView style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }} delay={300}>
      <Text style={{ color: secondaryTextColor, marginHorizontal }}>{t('multi-sig-modal-connect-recover-wallet')}:</Text>

      <FlatList
        contentContainerStyle={{ paddingVertical: 2, paddingBottom: 8 }}
        data={PairedDevices.devices}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        bounces={PairedDevices.devices.length > 3}
      />

      <FadeInDownView delay={500} style={{ marginTop: 5 }}>
        <Button title={t('button-next')} onPress={() => onNext(selectedDevice!)} disabled={!selectedDevice} />
      </FadeInDownView>
    </FadeInDownView>
  );
};

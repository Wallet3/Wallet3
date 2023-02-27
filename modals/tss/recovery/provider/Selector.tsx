import Animated, { FadeInUp } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../../utils/hardware';

import Aggregation from '../../aggregator/Aggregation';
import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
import { FadeInDownView } from '../../../../components/animations';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import ModalRootContainer from '../../../core/ModalRootContainer';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../../viewmodels/tss/management/PairedDevices';
import Preparations from '../requestor/Preparations';
import { ReactiveScreen } from '../../../../utils/device';
import RecoveryAggregation from '../requestor/RecoveryAggregation';
import ScrollTitles from '../../../components/ScrollTitles';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../../components/Utils';
import { verifiedColor } from '../../../../constants/styles';

interface Props {
  onNext: (selected: PairedDevice) => void;
}

export default ({ onNext }: Props) => {
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice>();
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;

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

      <FadeInDownView delay={500}>
        <Button title={t('button-next')} onPress={() => onNext(selectedDevice!)} disabled={!selectedDevice} />
      </FadeInDownView>
    </FadeInDownView>
  );
};

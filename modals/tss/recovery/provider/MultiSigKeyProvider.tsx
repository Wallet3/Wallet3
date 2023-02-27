import Animated, { FadeInUp } from 'react-native-reanimated';
import { FlatList, ScrollView, FlatList as SystemFlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../../utils/hardware';

import Aggregation from '../../aggregator/Aggregation';
import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
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

interface Props {
  vm: KeyRecoveryProvider;
  close: () => void;
  onCritical?: (critical: boolean) => void;
}

export default observer(({ close, onCritical, vm }: Props) => {
  const { t } = i18n;
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice>();
  const [step, setStep] = useState(0);

  const titles = [t('multi-sig-modal-title-wallet-recovery'), t('multi-sig-modal-title-waiting-aggregation')];

  const goTo = (step: number) => {
    setStep(step);
  };

  useEffect(() => () => vm.dispose(), []);

  const renderItem = ({ item }: { item: PairedDevice }) => {
    return (
      <TouchableOpacity onPress={() => setSelectedDevice(item)}>
        <DeviceInfo info={item.deviceInfo} />
      </TouchableOpacity>
    );
  };

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        <FlatList data={PairedDevices.devices} renderItem={renderItem} keyExtractor={(i) => i.id} />
        <Button title={t('button-next')} />
      </View>
    </ModalRootContainer>
  );
});

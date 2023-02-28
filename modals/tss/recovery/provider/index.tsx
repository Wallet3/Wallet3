import Animated, { FadeInUp } from 'react-native-reanimated';
import { FlatList, ScrollView, FlatList as SystemFlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../../utils/hardware';

import Aggregation from '../../aggregator/Aggregation';
import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
import Distribution from './Distribution';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import ModalRootContainer from '../../../core/ModalRootContainer';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../../viewmodels/tss/management/PairedDevices';
import Preparations from '../requestor/Preparations';
import { ReactiveScreen } from '../../../../utils/device';
import RecoveryAggregation from '../requestor/RecoveryAggregation';
import ScrollTitles from '../../../components/ScrollTitles';
import Selector from './Selector';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  close: () => void;
  onCritical?: (critical: boolean) => void;
  service: Service;
}

export default observer(({ close, onCritical, service }: Props) => {
  const { t } = i18n;

  const [step, setStep] = useState(0);
  const [vm, setVM] = useState<KeyRecoveryProvider>();

  const titles = [t('multi-sig-modal-title-wallet-recovery'), t('multi-sig-modal-title-key-distribution')];

  const goTo = (device: PairedDevice) => {
    setVM(new KeyRecoveryProvider({ service, shardKey: device.shard }));
    setStep(1);
  };

  useEffect(() => () => vm?.dispose(), [vm]);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} style={{ marginBottom: 12 }} />
      {step === 0 && <Selector onNext={goTo} />}
      {step === 1 && <Distribution vm={vm!} close={close} />}
    </ModalRootContainer>
  );
});

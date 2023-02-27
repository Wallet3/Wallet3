import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, View } from 'react-native';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../utils/hardware';

import BackableScrollTitles from '../../components/BackableScrollTitles';
import { KeyRecoveryRequestor } from '../../../viewmodels/tss/KeyRecoveryRequestor';
import ModalRootContainer from '../../core/ModalRootContainer';
import Preparations from './Preparations';
import { ReactiveScreen } from '../../../utils/device';
import ScrollTitles from '../../components/ScrollTitles';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  vm: KeyRecoveryRequestor;
  close: () => void;
  onCritical?: (critical: boolean) => void;
}

export default observer(({ close, onCritical, vm }: Props) => {
  const { t } = i18n;
  const { textColor } = Theme;

  const screenRadius = useOptimizedCornerRadius();

  const [step, setStep] = useState(0);

  const titleList = useRef<SystemFlatList>(null);
  const titles = [
    t('multi-sig-modal-title-welcome'),
    t('multi-sig-modal-title-devices-pairing'),
    t('multi-sig-modal-title-key-distribution'),
  ];

  const goToReceiving = (service: Service) => {
    goTo(2);
  };

  const goTo = (step: number) => {
    setStep(step);
    titleList.current?.scrollToIndex({ animated: true, index: step });
  };

  useEffect(() => () => vm?.dispose(), []);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        {step === 0 && <Preparations onNext={() => goTo(1)} />}
      </View>
    </ModalRootContainer>
  );
});

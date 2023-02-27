import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, View } from 'react-native';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../utils/hardware';

import Aggregation from '../aggregator/Aggregation';
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

  const [step, setStep] = useState(0);

  const titles = [t('multi-sig-modal-title-wallet-recovery'), t('multi-sig-modal-title-waiting-aggregation')];

  const goTo = (step: number) => {
    setStep(step);
    vm.start();
  };

  useEffect(() => () => vm.dispose(), []);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        {step === 0 && <Preparations onNext={() => goTo(1)} />}
        {step === 1 && (
          <Aggregation
            aggregated={vm.aggregated}
            device={vm.device}
            received={vm.received}
            threshold={vm.threshold}
            onButtonPress={close}
            buttonTitle={t('button-cancel')}
          />
        )}
      </View>
    </ModalRootContainer>
  );
});

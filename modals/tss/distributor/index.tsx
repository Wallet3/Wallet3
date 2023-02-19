import React, { useEffect, useState } from 'react';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';

import Animated from 'react-native-reanimated';
import BackableScrollTitles from '../../components/BackableScrollTitles';
import ConnectDevices from './ConnectDevices';
import { ModalMarginScreen } from '../../styles';
import ModalRootContainer from '../../core/ModalRootContainer';
import Preparations from './Preparations';
import { ReactiveScreen } from '../../../utils/device';
import ShardsDistribution from './ShardsDistribution';
import Theme from '../../../viewmodels/settings/Theme';
import ThresholdSetting from './ThresholdSetting';
import { View } from 'react-native';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useOptimizedCornerRadius } from '../../../utils/hardware';

interface Props {
  vm: ShardsDistributor;
  onCritical: (flag: boolean) => void;
  close: () => void;
}

export default observer(({ vm, onCritical, close }: Props) => {
  const { t } = i18n;
  const { textColor } = Theme;
  const [current, setCurrent] = useState({ step: 0, isRTL: false });

  const titles = [
    t('multi-sig-modal-title-preparations'),
    t('multi-sig-modal-title-connect-devices'),
    t('multi-sig-modal-title-set-threshold'),
    t('multi-sig-modal-title-key-distribution'),
  ];

  const goTo = (step: number, isRTL = false) => {
    step = Math.max(step, 0);
    setCurrent({ step, isRTL });
  };

  useEffect(() => () => vm.dispose(), []);

  const { step, isRTL } = current;

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        titles={titles}
        backDisabled={vm.status !== ShardsDistributionStatus.ready || step <= 1}
        showBack={vm.status === ShardsDistributionStatus.ready && step > 1}
        currentIndex={step}
        iconColor={textColor}
        onBackPress={() => goTo(step - 1, true)}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        {step === 0 && <Preparations onNext={() => goTo(1)} />}
        {step === 1 && <ConnectDevices vm={vm} onNext={() => goTo(2)} isRTL={isRTL} />}
        {step === 2 && <ThresholdSetting vm={vm} onNext={() => goTo(3)} isRTL={isRTL} />}
        {step === 3 && <ShardsDistribution vm={vm} close={close} onCritical={onCritical} />}
      </View>
    </ModalRootContainer>
  );
});

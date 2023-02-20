import React, { useEffect, useState } from 'react';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';

import Aggregation from './Aggregation';
import Animated from 'react-native-reanimated';
import BackableScrollTitles from '../../components/BackableScrollTitles';
import { ModalMarginScreen } from '../../styles';
import ModalRootContainer from '../../core/ModalRootContainer';
import { ReactiveScreen } from '../../../utils/device';
import ScrollTitles from '../../components/ScrollTitles';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import Theme from '../../../viewmodels/settings/Theme';
import { View } from 'react-native';
import Why from './Why';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useOptimizedCornerRadius } from '../../../utils/hardware';

interface Props {
  vm: ShardsAggregator;
  close: () => void;
}

export default observer(({ vm, close }: Props) => {
  const { t } = i18n;
  const [current, setCurrent] = useState({ step: 0 });
  const screenRadius = useOptimizedCornerRadius();

  const titles = [t('multi-sig-modal-title-preparations'), t('multi-sig-modal-title-waiting-aggregation')];

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  const goTo = (step: number) => {
    setCurrent({ step });
    vm.start();
  };

  const { step } = current;

  return (
    <ModalRootContainer>
      <ScrollTitles
        data={titles}
        currentIndex={step}
        style={{ flexGrow: 0, height: 32, marginBottom: 12, marginTop: screenRadius ? 4 : 0 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        {step === 0 && <Why onNext={() => goTo(1)} />}
        {step === 1 && <Aggregation vm={vm} buttonTitle={t('button-cancel')} onButtonPress={close} />}
      </View>
    </ModalRootContainer>
  );
});

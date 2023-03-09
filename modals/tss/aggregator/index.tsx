import React, { useEffect, useState } from 'react';

import Aggregation from './Aggregation';
import MiniAggregation from './MiniAggregation';
import { ModalMarginScreen } from '../../styles';
import ModalRootContainer from '../../core/ModalRootContainer';
import { ReactiveScreen } from '../../../utils/device';
import { SafeViewContainer } from '../../../components';
import ScrollTitles from '../../components/ScrollTitles';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import SquircleViewContainer from '../../../components/SquircleViewContainer';
import Theme from '../../../viewmodels/settings/Theme';
import { View } from 'react-native';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../../constants/styles';
import { useOptimizedCornerRadius } from '../../../utils/hardware';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  vm: ShardsAggregator;
  close: () => void;
  autoClose?: boolean;
}

export default observer(({ vm, close }: Props) => {
  const { aggregated } = vm;
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  useEffect(() => {
    if (!aggregated) return;
    const timer = setTimeout(close, 2500);
    return () => clearTimeout(timer);
  }, [aggregated]);

  return (
    <View style={{ backgroundColor: 'transparent', paddingTop: top || 16 }}>
      <MiniAggregation vm={vm} close={close} />
    </View>
  );
});

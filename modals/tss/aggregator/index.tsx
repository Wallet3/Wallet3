import React, { useEffect, useState } from 'react';

import Aggregation from './Aggregation';
import { ModalMarginScreen } from '../../styles';
import ModalRootContainer from '../../core/ModalRootContainer';
import { ReactiveScreen } from '../../../utils/device';
import ScrollTitles from '../../components/ScrollTitles';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import { View } from 'react-native';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useOptimizedCornerRadius } from '../../../utils/hardware';

interface Props {
  vm: ShardsAggregator;
  close: () => void;
  autoClose?: boolean;
}

export default observer(({ vm, close }: Props) => {
  const { t } = i18n;

  const screenRadius = useOptimizedCornerRadius();
  const { aggregated } = vm;

  const titles = [t('multi-sig-modal-title-waiting-aggregation')];

  useEffect(() => {
    return () => vm.dispose();
  }, []);

  useEffect(() => {
    if (!aggregated) return;
    const timer = setTimeout(close, 5000);
    return () => clearTimeout(timer);
  }, [aggregated]);

  return (
    <ModalRootContainer>
      <ScrollTitles
        data={titles}
        currentIndex={0}
        style={{ flexGrow: 0, height: 32, marginBottom: 12, marginTop: screenRadius ? 4 : 0 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        <Aggregation
          vm={vm}
          buttonTitle={aggregated ? t('button-done') : t('button-cancel')}
          onButtonPress={close}
          enableCacheOption
        />
      </View>
    </ModalRootContainer>
  );
});

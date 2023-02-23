import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, TouchableOpacity, View } from 'react-native';
import { getScreenCornerRadius, useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../utils/hardware';

import BackableScrollTitles from '../../components/BackableScrollTitles';
import ModalRootContainer from '../../core/ModalRootContainer';
import { ReactiveScreen } from '../../../utils/device';
import ScrollTitles from '../../components/ScrollTitles';
import { Service } from 'react-native-zeroconf';
import { ShardProvider } from '../../../viewmodels/tss/ShardProvider';
import ShardProviderView from './ShardProvider';
import { ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ close, vm }: { close: () => void; vm: ShardProvider }) => {
  const { t } = i18n;
  const { textColor } = Theme;
  const [height] = useState(360 + useOptimizedSafeBottom());
  const screenRadius = useOptimizedCornerRadius();

  const [step, setStep] = useState(0);

  const titleList = useRef<SystemFlatList>(null);
  const titles = [t('multi-sig-modal-title-request-secret-key')];

  const goTo = (step: number) => {
    setStep(step);
    titleList.current?.scrollToIndex({ animated: true, index: step });
  };

  useEffect(() => () => vm?.dispose(), [vm]);

  return (
    <ModalRootContainer style={{ height }}>
      <BackableScrollTitles
        showClose
        titles={titles}
        currentIndex={step}
        onClosePress={close}
        style={{ flexGrow: 0, height: 32, marginBottom: 12, marginTop: screenRadius ? 4 : 0 }}
      />

      <ShardProviderView vm={vm} close={close} />
    </ModalRootContainer>
  );
});

import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, View } from 'react-native';
import { getScreenCornerRadius, useOptimizedCornerRadius } from '../../../utils/hardware';

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

export default observer(({ close, vm }: { close: () => void; vm: ShardProvider }) => {
  const { t } = i18n;
  const { textColor } = Theme;

  const screenRadius = useOptimizedCornerRadius();
  
  const [step, setStep] = useState(0);

  const titleList = useRef<SystemFlatList>(null);
  const titles = [t('multi-sig-modal-title-welcome')];

  const goTo = (step: number) => {
    setStep(step);
    titleList.current?.scrollToIndex({ animated: true, index: step });
  };

  useEffect(() => () => vm?.dispose(), [vm]);

  return (
    <ModalRootContainer>
      <ScrollTitles
        currentIndex={step}
        data={titles}
        style={{ flexGrow: 0, height: 32, marginBottom: 12, marginTop: screenRadius ? 4 : 0 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        <ShardProviderView />
      </View>
    </ModalRootContainer>
  );
});

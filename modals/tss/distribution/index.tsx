import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, View } from 'react-native';

import ConnectDevices from './ConnectDevices';
import HowTo from './HowTo';
import { ReactiveScreen } from '../../../utils/device';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { FlatList } = Animated;

export default observer(({ vm }: { vm: ShardsDistributor }) => {
  const { t } = i18n;
  const { backgroundColor, textColor } = Theme;
  const [borderRadius] = useState(getScreenCornerRadius());
  const [step, setStep] = useState(0);
  const titleList = useRef<SystemFlatList>(null);
  const titles = [
    t('multi-sign-title-welcome'),
    t('multi-sign-title-connect-devices'),
    t('multi-sign-title-set-threshold'),
    t('multi-sign-title-key-distribution'),
  ];

  const renderTitle = ({ item }: { item: string }) => {
    return (
      <Text
        style={{
          fontSize: 25,
          fontWeight: '700',
          color: textColor,
        }}
      >
        {item}
      </Text>
    );
  };

  const goTo = (step: number) => {
    setStep(step);
    titleList.current?.scrollToIndex({ animated: true, index: step });
  };

  useEffect(() => () => vm.dispose(), []);

  return (
    <ScrollView
      pagingEnabled
      scrollEnabled={false}
      horizontal
      contentContainerStyle={{ flexGrow: 1 }}
      style={{
        position: 'relative',
        margin: 5,
        marginHorizontal: 6,
        backgroundColor,
        height: 420,
        borderRadius,
        overflow: 'hidden',
        padding: 16,
        paddingBottom: 16,
        paddingTop: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={titleList as any}
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 0, justifyContent: 'center', alignItems: 'center' }}
          data={titles}
          renderItem={renderTitle}
          style={{ flexGrow: 0, height: 32, marginBottom: 12 }}
          entering={FadeInUp.delay(300).springify()}
        />

        <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
          {step === 0 ? <HowTo onNext={() => goTo(1)} /> : undefined}
          {step === 1 ? <ConnectDevices vm={vm} /> : undefined}
        </View>
      </View>
    </ScrollView>
  );
});

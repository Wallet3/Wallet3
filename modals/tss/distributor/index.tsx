import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, TouchableOpacity, View } from 'react-native';

import ConnectDevices from './ConnectDevices';
import { Ionicons } from '@expo/vector-icons';
import Preparations from './Preparations';
import { ReactiveScreen } from '../../../utils/device';
import ShardsDistribution from './ShardsDistribution';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import ThresholdSetting from './ThresholdSetting';
import { ZoomInView } from '../../../components/animations';
import { calcHorizontalPadding } from '../components/Utils';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { FlatList } = Animated;

interface Props {
  vm: ShardsDistributor;
  onCritical: (flag: boolean) => void;
  close: () => void;
}

export default observer(({ vm, onCritical, close }: Props) => {
  const { t } = i18n;
  const { backgroundColor, textColor } = Theme;
  const [borderRadius] = useState(getScreenCornerRadius());
  const [step, setStep] = useState(0);
  const titleList = useRef<SystemFlatList>(null);
  const [backButtonPadding] = useState(calcHorizontalPadding());
  const titles = [
    t('multi-sign-title-preparations'),
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
    step = Math.max(step, 0);
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
        margin: 6,
        backgroundColor,
        height: 430,
        borderRadius,
        overflow: 'hidden',
        padding: 16,
        paddingTop: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            style={{ padding: backButtonPadding, margin: -backButtonPadding }}
            disabled={false}
            onPress={() => goTo(step - 1)}
          >
            <Ionicons name="arrow-back" size={22} color={textColor} style={{ opacity: step - 1, paddingStart: 2 }} />
          </TouchableOpacity>

          <FlatList
            ref={titleList as any}
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={titles}
            renderItem={renderTitle}
            style={{ height: 32 }}
            entering={FadeInUp.delay(300).springify()}
            contentContainerStyle={{
              flexGrow: 0,
              justifyContent: 'center',
              alignItems: 'center',
              marginStart: -backButtonPadding - 1,
            }}
          />
        </View>

        <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
          {step === 0 && <Preparations onNext={() => goTo(1)} />}
          {step === 1 && <ConnectDevices vm={vm} onNext={() => goTo(2)} />}
          {step === 2 && <ThresholdSetting vm={vm} onNext={() => goTo(3)} />}
          {step === 3 && <ShardsDistribution vm={vm} close={close} onCritical={onCritical} />}
        </View>
      </View>
    </ScrollView>
  );
});

import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, FlatList as SystemFlatList, Text, View } from 'react-native';

import DeviceSelector from './DeviceSelector';
import { ReactiveScreen } from '../../../utils/device';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import ShardReceiving from './ShardReceiving';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { FlatList } = Animated;

export default observer(() => {
  const { t } = i18n;
  const { backgroundColor, foregroundColor, textColor, appColor } = Theme;

  const [borderRadius] = useState(getScreenCornerRadius());
  const [vm, setVM] = useState<ShardReceiver>();
  const [step, setStep] = useState(0);
  const titleList = useRef<SystemFlatList>(null);
  const titles = [t('multi-sign-title-devices-pairing'), t('multi-sign-title-key-distribution')];

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

  const goToReceiving = (service: Service) => {
    setStep(1);
    setVM(new ShardReceiver(service));
    titleList.current?.scrollToIndex({ animated: true, index: 1 });
  };

  useEffect(() => () => vm?.dispose(), [vm]);

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
          {step === 0 && <DeviceSelector onNext={(s) => goToReceiving(s)} />}
          {step === 1 && vm && <ShardReceiving vm={vm} />}
        </View>
      </View>
    </ScrollView>
  );
});

import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '../../../components';
import { ReactiveScreen } from '../../../utils/device';
import Theme from '../../../viewmodels/settings/Theme';
import Welcome from './Welcome';
import { getScreenCornerRadius } from '../../../utils/ios';
import { observer } from 'mobx-react-lite';

const { FlatList } = Animated;

export default observer((props) => {
  const { backgroundColor, foregroundColor, textColor, appColor } = Theme;
  const [borderRadius] = useState(getScreenCornerRadius());
  const [step, setStep] = useState(1);
  const titleList = useRef<typeof FlatList>(null);
  const titles = ['MultiSig Wallet', 'Devices', 'Distribution'];

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
        />

        <View style={{ flex: 1, width: ReactiveScreen.width - 16, marginHorizontal: -16 }}>
          {step === 1 ? <Welcome /> : undefined}
        </View>

        <Button
          title="Next"
          txtStyle={{ fontSize: 18, fontWeight: '600' }}
          style={{
            borderRadius: 7 + (borderRadius - 20) / 2.5,
            height: 42 + (borderRadius - 20) / 5,
            marginHorizontal: (borderRadius - 20) / 5,
            marginBottom: (borderRadius - 20) / 8,
          }}
        />
      </View>
    </ScrollView>
  );
});

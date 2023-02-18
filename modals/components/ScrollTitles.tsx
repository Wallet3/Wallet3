import Animated, { FadeInUp } from 'react-native-reanimated';
import { FlatList, ListRenderItemInfo, StyleProp, Text, ViewStyle } from 'react-native';
import React, { useEffect, useRef } from 'react';

import Theme from '../../viewmodels/settings/Theme';

const { FlatList: AnimatedFlatList } = Animated;

interface Props {
  data: string[];
  currentIndex?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default (props: Props) => {
  const titleList = useRef<FlatList>(null);

  useEffect(
    () => titleList.current?.scrollToIndex({ index: Math.max(0, props.currentIndex ?? 0), animated: true }),
    [props.currentIndex]
  );

  const renderTitle = ({ item }: ListRenderItemInfo<string>) => {
    return (
      <Text
        style={{
          fontSize: 25,
          fontWeight: '700',
          color: Theme.textColor,
          textTransform: 'capitalize',
        }}
      >
        {item}
      </Text>
    );
  };

  return (
    <AnimatedFlatList
      ref={titleList as any}
      pagingEnabled
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      entering={FadeInUp.delay(300).springify()}
      renderItem={renderTitle}
      {...props}
      style={{ height: 32, ...(props.style as any) }}
    />
  );
};

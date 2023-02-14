import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  FadeOutDown,
  FadeOutLeft,
  FadeOutUp,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';

const { View } = Animated;

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export default ({ children, style, delay, duration }: Props) => {
  return (
    <View
      entering={FadeInUp.springify()
        .delay(delay ?? 0)
        .duration(duration ?? 300)}
      exiting={FadeOutUp.springify()}
      style={style}
    >
      {children}
    </View>
  );
};

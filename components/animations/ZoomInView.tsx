import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
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
      entering={ZoomIn.springify()
        .delay(delay ?? 0)
        .duration(duration ?? 300)}
      exiting={ZoomOut.delay(0)}
      style={style}
    >
      {children}
    </View>
  );
};

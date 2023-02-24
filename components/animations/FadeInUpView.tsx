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
import { StyleProp, ViewProps, ViewStyle } from 'react-native';

import React from 'react';

const { View } = Animated;

interface Props extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export default (props: Props) => {
  const { delay, duration } = props;

  return (
    <View
      entering={FadeInUp.springify()
        .delay(delay ?? 0)
        .duration(duration ?? 300)}
      exiting={FadeOutUp.springify()}
      {...props}
    >
      {props.children}
    </View>
  );
};

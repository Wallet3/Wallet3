import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import { View } from 'react-native-animatable';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const fadeInOut = {
  0: { opacity: 1 },
  0.5: { opacity: 0.25 },
  1: { opacity: 1 },
};

export default (props: Props) => {
  return (
    <View
      animation={fadeInOut}
      iterationCount={'infinite'}
      duration={2000}
      easing="linear"
      {...props}
      style={{ width: 100, height: 20, borderRadius: 6, backgroundColor: '#a0a0a020', ...((props.style as any) || {}) }}
    ></View>
  );
};

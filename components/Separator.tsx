import { StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { borderColor } from '../constants/styles';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default (props: Props) => {
  return <View style={{ height: 0.5, backgroundColor: borderColor, width: '100%', ...((props.style as any) || {}) }}></View>;
};

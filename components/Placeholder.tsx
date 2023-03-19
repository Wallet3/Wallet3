import { StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';

export default ({ flex, style }: { flex?: number; style?: StyleProp<ViewStyle> }) => {
  return <View style={[{ flex: flex ?? 1 }, style]} />;
};

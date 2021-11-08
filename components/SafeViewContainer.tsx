import { StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default ({ children, style }: { children: any; style?: StyleProp<ViewStyle> }) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: bottom == 0 ? 16 : 0, ...((style as any) || {}) }}>{children}</View>
  );
};

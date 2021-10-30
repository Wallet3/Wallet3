import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default ({ children, style }) => {
  const { bottom } = useSafeAreaInsets();
  return <View style={{ flex: 1, padding: 16, paddingBottom: bottom == 0 ? 16 : 0, ...(style || {}) }}>{children}</View>;
};

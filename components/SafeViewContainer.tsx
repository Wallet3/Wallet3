import { StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: any;
  style?: StyleProp<ViewStyle>;
  paddingHeader?: boolean;
  includeTopPadding?: boolean;
}

export default ({ children, style, paddingHeader, includeTopPadding }: Props) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingTop: paddingHeader ? (includeTopPadding ? 16 : 0) + useHeaderHeight() : 0,
        paddingBottom: bottom || 16,
        ...((style as any) || {}),
      }}
    >
      {children}
    </View>
  );
};

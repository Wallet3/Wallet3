import { StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { ReactiveScreen } from '../utils/device';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: any;
  style?: StyleProp<ViewStyle>;
  paddingHeader?: boolean;
  includeTopPadding?: boolean;
}

export default ({ children, style, paddingHeader, includeTopPadding }: Props) => {
  const { bottom, top } = useSafeAreaInsets();
  const isPortrait = ReactiveScreen.isPortrait;
  ReactiveScreen.setSafeAreaBottom(bottom);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingTop:
          paddingHeader !== undefined
            ? (includeTopPadding ? 16 : 0) + (isPortrait ? useHeaderHeight() : useHeaderHeight() + top) // for landscape mode, the useHeaderHeight() doesn't include the safe-top padding, for portrait mode, useHeaderHeight() does include the safe-top padding
            : 16,
        paddingBottom: bottom || 16,
        ...((style as any) || {}),
      }}
    >
      {children}
    </View>
  );
};

import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import Theme from '../viewmodels/settings/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  cornerRadius?: number;
  useSafeBottom?: boolean;
}

export default ({ style, children, cornerRadius, useSafeBottom }: Props) => {
  return (
    <SquircleView
      style={{
        paddingBottom: useSafeBottom ? useSafeAreaInsets().bottom : undefined,
        ...(style as any),
        flex: 1,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        borderRadius: cornerRadius,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
      squircleParams={{
        fillColor: style?.['backgroundColor'] ?? Theme.backgroundColor,
        cornerRadius: cornerRadius,
        bottomLeftCornerRadius: 0,
        bottomRightCornerRadius: 0,
        cornerSmoothing: 0.81,
      }}
    >
      {children}
    </SquircleView>
  );
};

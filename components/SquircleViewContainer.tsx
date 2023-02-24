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
  excludeBottomCorners?: boolean;
}

export default ({ style, children, cornerRadius, useSafeBottom, excludeBottomCorners }: Props) => {
  return (
    <SquircleView
      style={{
        paddingBottom: useSafeBottom ? useSafeAreaInsets().bottom : undefined,
        ...(style as any),
        flex: 1,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        borderRadius: cornerRadius,
        borderBottomLeftRadius: excludeBottomCorners ? 0 : cornerRadius,
        borderBottomRightRadius: excludeBottomCorners ? 0 : cornerRadius,
      }}
      squircleParams={{
        fillColor: style?.['backgroundColor'] ?? Theme.backgroundColor,
        cornerRadius: cornerRadius,
        bottomLeftCornerRadius: excludeBottomCorners ? 0 : cornerRadius,
        bottomRightCornerRadius: excludeBottomCorners ? 0 : cornerRadius,
        cornerSmoothing: 0.81,
      }}
    >
      {children}
    </SquircleView>
  );
};

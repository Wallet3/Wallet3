import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import Theme from '../../viewmodels/settings/Theme';
import { useScreenCornerRadius } from '../../utils/hardware';

interface Props {
  cornerRadius?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default ({ cornerRadius, children, style }: Props) => {
  const { backgroundColor } = Theme;
  const DefaultCornerRadius = cornerRadius ?? useScreenCornerRadius();

  return (
    <ScrollView
      pagingEnabled
      scrollEnabled={false}
      horizontal
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ position: 'relative', backgroundColor: 'transparent' }}
    >
      <SquircleView
        squircleParams={{
          cornerRadius: DefaultCornerRadius,
          cornerSmoothing: 0.81,
          fillColor: style?.['backgroundColor'] ?? backgroundColor,
        }}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          width: '100%',
          height: 430,
          margin: 6,
          padding: 16,
          overflow: 'hidden',
          borderRadius: DefaultCornerRadius,
          ...(style as any),
        }}
      >
        {children}
      </SquircleView>
    </ScrollView>
  );
};

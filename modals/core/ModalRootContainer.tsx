import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import Theme from '../../viewmodels/settings/Theme';
import { useScreenCornerRadius } from '../../utils/hardware';

export default ({ children, style }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) => {
  const { backgroundColor } = Theme;
  const borderRadius = useScreenCornerRadius();

  return (
    <ScrollView
      pagingEnabled
      scrollEnabled={false}
      horizontal
      contentContainerStyle={{ flexGrow: 1 }}
      style={{
        position: 'relative',
        backgroundColor: 'transparent',
      }}
    >
      <SquircleView
        squircleParams={{ cornerRadius: borderRadius, cornerSmoothing: 0.64, fillColor: backgroundColor }}
        style={{
          flex: 1,
          margin: 6,
          backgroundColor: 'transparent',
          width: '100%',
          height: 430,
          padding: 16,
          ...(style as any),
        }}
      >
        {children}
      </SquircleView>
    </ScrollView>
  );
};

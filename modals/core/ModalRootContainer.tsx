import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import React from 'react';
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
        margin: 6,
        backgroundColor,
        height: 430,
        borderRadius,
        roundness: 0.17650602409638552,
        overflow: 'hidden',
        padding: 16,
        ...(style as any),
      }}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </ScrollView>
  );
};
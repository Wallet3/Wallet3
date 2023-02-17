import Animated, { FadeInUp } from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
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
        paddingTop: 20,
        ...(style as any),
      }}
    >
      {children}
    </ScrollView>
  );
};

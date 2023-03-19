import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from 'react-native';
import { isAndroid } from '../../utils/platform';

interface Props {
  icon: string | 'warning' | 'information-circle';
  color?: string;
  message?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export default ({ icon, color, message, delay, style }: Props) => {
  return (
    <Animated.View style={{ flexDirection: 'row', ...(style as any) }} entering={FadeInDown.delay(delay ?? 0).springify()}>
      <Ionicons name={icon as any} color={color} style={{ marginEnd: 5, marginTop: isAndroid ? 3 : 1 }} />
      <Text style={{ fontSize: 12, fontWeight: '600', marginEnd: 2, color: color }}>{message}</Text>
    </Animated.View>
  );
};

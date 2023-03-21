import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated';
import { StyleProp, Text, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default ({ exception, containerStyle }: { exception: string; containerStyle?: StyleProp<ViewStyle> }) => {
  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
      bounces={false}
      entering={FadeIn.springify()}
      exiting={FadeOut.springify()}
      contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16 }}
      style={[
        {
          borderRadius: 10,
          marginTop: 5,
          backgroundColor: 'crimson',
          minHeight: 22,
          maxHeight: 30,
        },
        containerStyle,
      ]}
    >
      <Ionicons name="alert-circle" color="white" size={16} style={{ marginBottom: -1 }} />
      <Text style={{ color: 'white', marginStart: 8, fontSize: 12 }}>{exception}</Text>
    </Animated.ScrollView>
  );
};

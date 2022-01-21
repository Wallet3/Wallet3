import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';

import CachedImage from 'react-native-expo-cached-image';
import React from 'react';

interface Props {
  uri?: string;
  backgroundColor?: string;
  emoji?: string;
  emojiSize?: number;
  size: number;
  style?: StyleProp<ViewStyle>;
}

export default ({ uri, backgroundColor, emoji, size, emojiSize, style }: Props) => {
  return uri ? (
    uri.endsWith('.gif') ? (
      <Image
        source={{ uri }}
        style={{
          ...(style || ({} as any)),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor,
        }}
      />
    ) : (
      <CachedImage
        source={{ uri }}
        style={{
          ...(style || ({} as any)),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor,
        }}
      />
    )
  ) : (
    <View
      style={{
        ...(style || ({} as any)),
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ textAlign: 'center', marginStart: 1.5, marginTop: 1.5, fontSize: emojiSize }}>{emoji}</Text>
    </View>
  );
};

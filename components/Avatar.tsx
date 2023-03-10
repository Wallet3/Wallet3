import { Image, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import CachedImage from 'react-native-fast-image';
import React from 'react';

interface Props {
  uri?: string;
  backgroundColor?: string;
  emoji?: string;
  emojiSize?: number;
  size: number;
  style?: StyleProp<ViewStyle>;
  emojiMarginStart?: number;
  emojiMarginTop?: number;
}

export default ({ uri, backgroundColor, emoji, size, emojiSize, style, emojiMarginStart, emojiMarginTop }: Props) => {
  return uri ? (
    <CachedImage
      source={{ uri }}
      style={{
        ...(style || ({} as any)),
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor,
        overflow: 'hidden',
      }}
    />
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
      <Text
        style={{
          textAlign: 'center',
          marginStart: emojiMarginStart || 1.5,
          marginTop: emojiMarginTop || 1.5,
          fontSize: emojiSize,
        }}
      >
        {emoji}
      </Text>
    </View>
  );
};

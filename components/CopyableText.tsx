import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';

interface Props {
  copyText: string;
  title?: string;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  iconStyle?: StyleProp<ViewStyle>;
  txtLines?: number;
  hideIcon?: boolean;
}

export default ({ copyText, txtStyle, iconStyle, iconSize, iconColor, title, txtLines, hideIcon }: Props) => {
  const txtView = useRef<Animatable.Text>(null);

  const writeAddressToClipboard = () => {
    setStringAsync(copyText || '');
    txtView.current?.flash?.();
  };

  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => writeAddressToClipboard()}>
      <Animatable.Text ref={txtView as any} style={txtStyle} numberOfLines={txtLines || 1}>
        {title || copyText}
        {'  '}
        {!hideIcon && <Feather name="copy" size={iconSize ?? 12} color={iconColor ?? '#fff'} style={[iconStyle]} />}
      </Animatable.Text>
    </TouchableOpacity>
  );
};

import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { setString } from 'expo-clipboard';

interface Props {
  copyText: string;
  title?: string;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  iconStyle?: StyleProp<ViewStyle>;
}

export default ({ copyText, txtStyle, iconStyle, iconSize, iconColor, title }: Props) => {
  const txtView = useRef<Animatable.Text>(null);

  const writeAddressToClipboard = () => {
    setString(copyText || '');
    txtView.current?.flash?.();
  };

  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => writeAddressToClipboard()}>
      <Animatable.Text ref={txtView as any} style={txtStyle} numberOfLines={1}>
        {title || copyText}
      </Animatable.Text>

      <Feather name="copy" size={iconSize ?? 10} color={iconColor ?? '#fff'} style={iconStyle} />
    </TouchableOpacity>
  );
};

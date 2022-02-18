import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Feather } from '@expo/vector-icons';
import { setString } from 'expo-clipboard';

interface Props {
  copyText: string;
  title?: string;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  iconStyle?: StyleProp<ViewStyle>;
  txtLines?: number;
}

export default ({ copyText, txtStyle, iconStyle, iconSize, iconColor, title, txtLines }: Props) => {
  const txtView = useRef<Animatable.Text>(null);

  const writeAddressToClipboard = () => {
    setString(copyText || '');
    txtView.current?.flash?.();
  };

  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => writeAddressToClipboard()}>
      <Animatable.Text ref={txtView as any} style={txtStyle} numberOfLines={txtLines || 1}>
        {title || copyText}
      </Animatable.Text>

      <Feather name="copy" size={iconSize ?? 10} color={iconColor ?? '#fff'} style={iconStyle} />
    </TouchableOpacity>
  );
};

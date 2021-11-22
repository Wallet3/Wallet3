import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { formatAddress } from '../utils/formatter';
import { setString } from 'expo-clipboard';

interface Props {
  txt: string;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  iconStyle?: StyleProp<ViewStyle>;
  format?: boolean;
}

export default ({ txt, txtStyle, iconStyle, iconSize, iconColor, format }: Props) => {
  const addressView = useRef<Animatable.Text>(null);

  const writeAddressToClipboard = () => {
    setString(txt || '');
    addressView.current?.flash?.();
  };

  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => writeAddressToClipboard()}>
      <Animatable.Text ref={addressView as any} style={txtStyle}>
        {format ? formatAddress(txt ?? '', 7, 5) : txt}
      </Animatable.Text>

      <Feather name="copy" size={iconSize ?? 10} color={iconColor ?? '#fff'} style={iconStyle} />
    </TouchableOpacity>
  );
};

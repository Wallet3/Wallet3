import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ZoomInView } from './animations';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
}

export default ({ containerStyle, txtStyle, iconSize, iconColor, iconStyle }: Props) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff30',
          borderRadius: 5,
        },
        containerStyle,
      ]}
    >
      <Text style={[{ textTransform: 'uppercase', color: '#fff', fontSize: 10, fontWeight: '700' }, txtStyle]}>Super</Text>
      <MaterialCommunityIcons
        name="lightning-bolt"
        color={iconColor ?? '#fff'}
        style={[{ marginStart: 4 }, iconStyle]}
        size={iconSize ?? 9}
      />
    </View>
  );
};

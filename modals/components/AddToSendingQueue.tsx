import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { t } from 'i18n-js';

interface Props {
  themeColor: string;
  containerStyle?: StyleProp<ViewStyle>;
  txtStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  checked?: boolean;
  onToggle?: () => void;
}

export default (props: Props) => {
  const { themeColor, containerStyle, txtStyle, iconSize, checked, onToggle } = props;
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        containerStyle,
      ]}
    >
      <Ionicons name="checkbox" color={checked ? themeColor : 'lightgrey'} size={iconSize ?? 12.5} />
      <Text style={[{ fontWeight: '600', color: '#333', fontSize: 12.5 }, txtStyle]}>{t('erc-4337-add-tx-to-queue')}</Text>
    </TouchableOpacity>
  );
};

import React, { useRef, useState } from 'react';
import { StyleProp, Text, TextInput, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { borderColor, fontColor, secondaryFontColor } from '../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import { getStringAsync } from 'expo-clipboard';

interface Props {
  onChangeText: (text: string) => void;
  title?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  textColor?: string;
}

export default ({ value, onChangeText, title, style, placeholder, defaultValue, iconColor, textColor }: Props) => {
  const addrRef = useRef<TextInput>(null);

  const readClipboard = async () => {
    const txt = await getStringAsync();
    if (!txt) return;
    onChangeText(txt);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        position: 'relative',
        height: 42,
        borderColor,
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        paddingStart: 12,
        alignItems: 'center',
        marginBottom: 8,

        ...((style as any) || {}),
      }}
    >
      <Text style={{ fontSize: 18, color: secondaryFontColor, marginEnd: title ? 12 : 0 }}>{title}</Text>
      <TextInput
        ref={addrRef}
        style={{ fontSize: 20, flex: 1, color: textColor ?? fontColor }}
        value={value}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoCapitalize="none"
        keyboardType="web-search"
        placeholderTextColor="#dfdfdf50"
        autoCorrect={false}
        onChangeText={(t) => onChangeText(t)}
      />

      <TouchableOpacity onPress={(_) => readClipboard()}>
        <Ionicons name="clipboard-outline" size={20} style={{ marginStart: 12 }} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

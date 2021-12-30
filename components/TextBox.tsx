import React, { useRef, useState } from 'react';
import { StyleProp, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
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
}

export default ({ value, onChangeText, title, style, placeholder, defaultValue }: Props) => {
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
      <Text style={{ fontSize: 18, color: secondaryFontColor, marginEnd: 12 }}>{title}</Text>
      <TextInput
        ref={addrRef}
        style={{ fontSize: 20, flex: 1, color: fontColor }}
        value={value}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoCapitalize="none"
        keyboardType="web-search"
        placeholderTextColor="#dfdfdf"
        autoCorrect={false}
        onChangeText={(t) => onChangeText(t)}
      />

      <TouchableOpacity onPress={(_) => readClipboard()}>
        <Ionicons name="copy-outline" size={20} style={{ marginStart: 12, opacity: 0.5 }} />
      </TouchableOpacity>
    </View>
  );
};

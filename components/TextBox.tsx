import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import { getStringAsync } from 'expo-clipboard';

interface Props {
  onChangeText: (text: string) => void;
  title: string;
  value: string;
}

export default ({ value, onChangeText, title }: Props) => {
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
      }}
    >
      <Text style={{ fontSize: 18, color: secondaryFontColor, marginEnd: 12 }}>{title}</Text>
      <TextInput
        ref={addrRef}
        style={{ fontSize: 20, flex: 1, color: fontColor }}
        value={value}
        onChangeText={(t) => onChangeText(t)}
      />

      <TouchableOpacity onPress={(_) => readClipboard()}>
        <Ionicons name="copy-outline" size={20} style={{ marginStart: 12, opacity: 0.5 }} />
      </TouchableOpacity>
    </View>
  );
};

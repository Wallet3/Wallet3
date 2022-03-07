import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { StyleProp, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { borderColor, fontColor, secondaryFontColor } from '../constants/styles';

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
  onScanRequest?: () => void;
}

export default ({
  value,
  onChangeText,
  title,
  style,
  placeholder,
  defaultValue,
  iconColor,
  textColor,
  onScanRequest,
}: Props) => {
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

      {onScanRequest && (
        <TouchableOpacity style={{ paddingHorizontal: 6 }} onPress={onScanRequest}>
          <Ionicons name="scan-outline" size={20} color={iconColor} />
          <View
            style={{
              position: 'absolute',
              width: 14,
              height: 1,
              backgroundColor: iconColor,
              left: 8,
              top: 10.5,
              opacity: 1.5,
              borderRadius: 2,
            }}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={(_) => readClipboard()}>
        <Ionicons name="clipboard-outline" size={20} style={{ marginHorizontal: 5, marginEnd: 2 }} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

import { Button, SafeViewContainer } from '../../components';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface Props {
  onConfirm: () => void;
  desc: string;
  buttonText: string;
  themeColor: string;
  style?: StyleProp<ViewStyle>;
}

export function Confirm({ onConfirm, desc, buttonText, themeColor, style }: Props) {
  return (
    <SafeViewContainer style={style}>
      <View style={{ flex: 1 }} />

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="warning" size={72} color={themeColor} />
        <Text style={{ color: themeColor }}>{desc}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <Button title={buttonText} themeColor="crimson" onLongPress={onConfirm} />
    </SafeViewContainer>
  );
}

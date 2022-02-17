import { Button, SafeViewContainer } from '../../components';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface Props {
  onLongConfirm?: () => void;
  onSwipeConfirm?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  desc: string;
  confirmButtonTitle: string;
  cancelButtonTitle?: string;
  themeColor: string;
  style?: StyleProp<ViewStyle>;
  cancelable?: boolean;
}

export function Confirm({
  onLongConfirm,
  onSwipeConfirm,
  onConfirm,
  onCancel,
  desc,
  confirmButtonTitle,
  cancelButtonTitle,
  themeColor,
  style,
  cancelable,
}: Props) {
  return (
    <SafeViewContainer style={style}>
      <View style={{ flex: 1 }} />

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="warning" size={72} color={themeColor} />
        <Text style={{ color: themeColor, textAlign: 'center' }}>{desc}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title={confirmButtonTitle}
        themeColor={themeColor}
        onPress={onConfirm}
        onLongPress={onLongConfirm}
        onSwipeSuccess={onSwipeConfirm}
      />

      {cancelable && (
        <Button title={cancelButtonTitle} reverse themeColor={themeColor} onPress={onCancel} style={{ marginTop: 12 }} />
      )}
    </SafeViewContainer>
  );
}

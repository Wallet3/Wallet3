import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default ({ size, color, onPress, disabled }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Ionicons name="ios-arrow-back-circle-outline" size={size || 33} color={disabled ? '#D3D3D350' : color || '#627EEA'} />
    </TouchableOpacity>
  );
};

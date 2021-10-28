import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface Props {
  size?: number;
  color?: string;
  onPress?: () => void;
}

export default ({ size, color, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons name="ios-arrow-back-circle-outline" size={size || 33} color={color || '#627EEA'} />
    </TouchableOpacity>
  );
};

import React from 'react';
import { View } from 'react-native';

export const renderEmptyCircle = (index: number, color = '#000') => (
  <View
    key={index}
    style={{ borderRadius: 10, width: 20, height: 20, borderWidth: 2, marginHorizontal: 6, borderColor: color }}
  />
);

export const renderFilledCircle = (index: number, color = '#000') => (
  <View key={index} style={{ borderRadius: 10, backgroundColor: color, width: 20, height: 20, marginHorizontal: 6 }} />
);

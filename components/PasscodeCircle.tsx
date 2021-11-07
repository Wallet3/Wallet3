import React from 'react';
import { View } from 'react-native';

export const renderEmptyCircle = (index: number) => (
  <View key={index} style={{ borderRadius: 10, width: 20, height: 20, borderWidth: 2, marginHorizontal: 6 }} />
);

export const renderFilledCircle = (index: number) => (
  <View key={index} style={{ borderRadius: 10, backgroundColor: '#000', width: 20, height: 20, marginHorizontal: 6 }} />
);

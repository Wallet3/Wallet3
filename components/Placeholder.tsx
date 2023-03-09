import React from 'react';
import { View } from 'react-native';

export default ({ flex }: { flex?: number }) => {
  return <View style={{ flex: flex ?? 1 }} />;
};

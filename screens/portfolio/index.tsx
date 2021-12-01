import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default () => {
  return (
    <View style={{ backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
    </View>
  );
};

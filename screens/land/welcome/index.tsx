import {} from 'react-native';

import { Text, View } from 'react-native-animatable';

import React from 'react';
import { useFonts } from 'expo-font';

export default () => {
  //   const [loaded] = useFonts({
  //     Questrial: require('../../../assets/fonts/Questrial.ttf'),
  //   });

  //   if (!loaded) {
  //     return null;
  //   }

  return (
    <View style={{ padding: 16, alignItems: 'center', flex: 1 }}>
      <View style={{ flex: 1 }} />
      <Text animation="fadeInUp" style={{ fontFamily: 'Questrial', fontWeight: '600', fontSize: 42, color: '#6186ff' }}>
        Wallet 3
      </Text>
      <View style={{ flex: 1 }} />

      <View></View>
    </View>
  );
};

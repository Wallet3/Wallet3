import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';

export default () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView autoPlay duration={3000} style={{ width: 230, height: 230 }} source={require('../../assets/animations/loading.json')} />
    </View>
  );
};

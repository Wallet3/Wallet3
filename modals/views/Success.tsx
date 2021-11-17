import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';

export default () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        style={{
          width: 200,
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        loop={false}
        autoPlay
        source={require('../../assets/animations/success.json')}
      />
    </View>
  );
};

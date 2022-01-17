import React, { useEffect, useRef } from 'react';

import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export default () => {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    ref.current?.play();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        ref={ref}
        loop={false}
        source={require('../../assets/animations/success.json')}
        style={{
          width: 200,
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </View>
  );
};

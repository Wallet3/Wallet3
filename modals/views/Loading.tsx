import React, { useEffect, useRef } from 'react';

import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export default () => {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    ref?.current?.play();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        ref={ref}
        duration={3000}
        style={{ width: 230, height: 230 }}
        source={require('../../assets/animations/loading.json')}
      />
    </View>
  );
};

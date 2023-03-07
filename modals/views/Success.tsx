import React, { useEffect, useRef } from 'react';

import LottieView from 'lottie-react-native';
import { ReactiveScreen } from '../../utils/device';
import { ZoomInView } from '../../components/animations';

export default ({ size }: { size?: number }) => {
  size = size ?? Math.min(ReactiveScreen.width - 24, 300);
  console.log(size);

  return (
    <ZoomInView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        autoPlay
        loop={false}
        source={require('../../assets/animations/check-verde.json')}
        style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </ZoomInView>
  );
};

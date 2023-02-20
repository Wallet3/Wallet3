import { FadeInDownView, ZoomInView } from '../../../components/animations';

import Device from '../../../components/Device';
import LottieView from 'lottie-react-native';
import React from 'react';

export default ({ deviceId, os, delay }: { deviceId: string; os: 'ios' | 'android'; delay?: number }) => {
  return (
    <ZoomInView
      delay={delay}
      style={{ position: 'relative', width: 250, height: 250, justifyContent: 'center', alignItems: 'center' }}
    >
      <LottieView
        style={{ width: 250, height: 250, position: 'absolute' }}
        duration={7000}
        source={require('../../../assets/animations/ripple.json')}
        autoPlay
      />

      <FadeInDownView style={{ justifyContent: 'center', alignItems: 'center' }} delay={(delay || 0) + 200}>
        <Device deviceId={deviceId} os={os} style={{ width: 48, height: 52 }} />

        {/* <Text numberOfLines={1} style={{ fontSize: 12, marginTop: 8, marginBottom: -24, color: secondaryTextColor }}>
              {vm.device.name}
            </Text> */}
      </FadeInDownView>
    </ZoomInView>
  );
};

import { FadeInDownView, ZoomInView } from '../../../components/animations';
import { StyleProp, ViewStyle } from 'react-native';

import Device from '../../../components/Device';
import LottieView from 'lottie-react-native';
import React from 'react';

interface Props {
  deviceId: string;
  os: 'ios' | 'android';
  delay?: number;
  containerStyle?: StyleProp<ViewStyle>;
  deviceStyle?: { width: number; height: number };
  rippleStyle?: { width?: number; height?: number; opacity?: number };
}

export default ({ deviceId, os, delay, containerStyle, deviceStyle, rippleStyle }: Props) => {
  return (
    <ZoomInView
      delay={delay}
      style={{
        position: 'relative',
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        ...(containerStyle as any),
      }}
    >
      <LottieView
        style={{ width: 250, height: 250, ...rippleStyle, position: 'absolute' }}
        duration={7000}
        source={require('../../../assets/animations/ripple.json')}
        autoPlay
      />

      <FadeInDownView style={{ justifyContent: 'center', alignItems: 'center' }} delay={(delay || 0) + 200}>
        <Device deviceId={deviceId} os={os} style={deviceStyle ?? { width: 48, height: 52 }} />

        {/* <Text numberOfLines={1} style={{ fontSize: 12, marginTop: 8, marginBottom: -24, color: secondaryTextColor }}>
              {vm.device.name}
            </Text> */}
      </FadeInDownView>
    </ZoomInView>
  );
};

import LottieView from 'lottie-react-native';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { ZoomInView } from '../../components/animations';

export default () => {
  const { backgroundColor } = Theme;
  return (
    <ZoomInView style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor }}>
      <LottieView source={require('../../assets/animations/pack.json')} style={{ width: 200, height: 200 }} autoPlay />
    </ZoomInView>
  );
};

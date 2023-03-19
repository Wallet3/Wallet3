import Passpad, { PasspadProps } from './Passpad';

import { INetwork } from '../../common/Networks';
import LottieView from 'lottie-react-native';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { View } from 'react-native';
import { ZoomInView } from '../../components/animations';

interface Props extends PasspadProps {
  busy?: boolean;
}

export default (props: Props) => {
  const { backgroundColor } = Theme;
  
  return (
    <SafeViewContainer>
      {props.busy ? (
        <ZoomInView style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <LottieView source={require('../../assets/animations/pack.json')} style={{ width: 200, height: 200 }} autoPlay />
        </ZoomInView>
      ) : (
        <Passpad {...props} style={{ backgroundColor }} />
      )}
    </SafeViewContainer>
  );
};

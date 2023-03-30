import Animated, { FadeIn } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';
import i18n from '../../i18n';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default ({ style }: Props) => {
  const { t } = i18n;
  return (
    <Animated.Text
      entering={FadeIn.springify()}
      style={[
        {
          color: 'crimson',
          textAlign: 'right',
          fontSize: 12.5,
          fontWeight: '600',
          marginEnd: 18,
        },
        style,
      ]}
    >
      {t('tip-insufficient-funds')}
    </Animated.Text>
  );
};

import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import Button from '../components/Button';
import React from 'react';
import Welcome from '../components/Introduction';
import i18n from '../../../i18n';

const { View } = Animated;

export default ({ onNext }: { onNext?: () => void }) => {
  const { t } = i18n;

  return (
    <View style={{ flex: 1 }} entering={FadeInDown.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <Welcome />
      <Button title={t('button-start')} onPress={onNext} />
    </View>
  );
};

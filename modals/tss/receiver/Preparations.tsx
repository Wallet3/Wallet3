import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import Button from '../components/Button';
import React, {  } from 'react';
import Welcome from '../components/Introduction';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext }: { onNext: () => void }) => {
  const { t } = i18n;

  return (
    <View style={{ flex: 1 }} entering={FadeInDown.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <Welcome disablePage2 disablePage3 />
      <Button title={t('button-next')} onPress={onNext} />
    </View>
  );
});

import Animated, { FadeInRight } from 'react-native-reanimated';

import React from 'react';
import { ReactiveScreen } from '../../../utils/device';
import { StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { thirdFontColor } from '../../../constants/styles';

const { View, Text } = Animated;

export default observer(() => {
  const { t } = i18n;

  return (
    <View style={{ flex: 1 }} entering={FadeInRight.delay(500).springify()}>
      <Swiper paginationStyle={{ marginBottom: -8 }} autoplay>
        <View style={styles.contentContainer}>
          <View style={{ flex: 1 }} />
          <Text style={styles.txt}>{t('multi-sign-welcome-1')}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={{ flex: 1 }} />
          <Text style={styles.txt}>{t('multi-sign-welcome-2')}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={{ flex: 1 }} />
          <Text style={styles.txt}>{t('multi-sign-welcome-3')}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={{ flex: 1 }} />
          <Text style={styles.txt}>{t('multi-sign-welcome-4')}</Text>
        </View>
      </Swiper>
    </View>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 36,
  },
  txt: {
    fontSize: 15,
    marginBottom: 8,
    marginHorizontal: 12,
    color: thirdFontColor,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';

import Animated from 'react-native-reanimated';
import IllustrationConfirmed from '../../../assets/illustrations/tss/confirmed.svg';
import IllustrationMenuGuide from '../../../assets/illustrations/tss/menu.svg';
import IllustrationSameNetwork from '../../../assets/illustrations/tss/internet.svg';
import IllustrationSync from '../../../assets/illustrations/tss/sync.svg';
import { ReactiveScreen } from '../../../utils/device';
import { StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import styles from './styles'
import { thirdFontColor } from '../../../constants/styles';

const { View, Text } = Animated;

interface Props {
  disablePage1?: boolean;
  disablePage2?: boolean;
  disablePage3?: boolean;
  disablePage4?: boolean;
}

export default ({ disablePage1, disablePage2, disablePage3, disablePage4 }: Props) => {
  const { t } = i18n;
  const [width] = useState(ReactiveScreen.width - 72);

  return (
    <Swiper paginationStyle={{ marginBottom: -10 }} autoplay dotStyle={{ backgroundColor: `${Theme.secondaryTextColor}40` }}>
      {!disablePage1 && (
        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationSameNetwork width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-welcome-1')}</Text>
        </View>
      )}

      {!disablePage2 && (
        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationMenuGuide width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-welcome-2')}</Text>
        </View>
      )}

      {!disablePage3 && (
        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationConfirmed width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-welcome-3')}</Text>
        </View>
      )}

      {!disablePage4 && (
        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationSync width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-welcome-4')}</Text>
        </View>
      )}
    </Swiper>
  );
};

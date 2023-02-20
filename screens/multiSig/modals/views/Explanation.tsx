import { ActivityIndicator, Button, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';

import { FadeInDownView } from '../../../../components/animations';
import IllustrationSameNetwork from '../../../../assets/illustrations/tss/internet.svg';
import IllustrationTeam from '../../../../assets/illustrations/tss/collaboration.svg';
import { ReactiveScreen } from '../../../../utils/device';
import Swiper from 'react-native-swiper';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import styles from '../../../../modals/tss/components/styles';

const { View, Text } = Animated;

export default ({ onNext }: { onNext: () => void }) => {
  const { t } = i18n;
  const [width] = useState(ReactiveScreen.width - 72);

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <Swiper paginationStyle={{ marginBottom: -10 }} autoplay dotStyle={{ backgroundColor: `${Theme.secondaryTextColor}40` }}>
        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationSameNetwork width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-welcome-1')}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.illustrationContainer}>
            <IllustrationTeam width={width} height={150} />
          </View>
          <Text style={styles.txt}>{t('multi-sig-modal-msg-before-aggregation')}</Text>
        </View>
      </Swiper>

      <Button title={t('button-next')} onPress={onNext} />
    </FadeInDownView>
  );
};

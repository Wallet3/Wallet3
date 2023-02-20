import { ActivityIndicator, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, ZoomInView } from '../../../components/animations';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';
import { useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../utils/hardware';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import IllustrationSameNetwork from '../../../assets/illustrations/tss/internet.svg';
import IllustrationTeam from '../../../assets/illustrations/tss/collaboration.svg';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Passpad } from '../../views';
import { ReactiveScreen } from '../../../utils/device';
import { ShardSender } from '../../../viewmodels/tss/ShardSender';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Swiper from 'react-native-swiper';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { styles } from '../components/Introduction';
import { useHorizontalPadding } from '../components/Utils';

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

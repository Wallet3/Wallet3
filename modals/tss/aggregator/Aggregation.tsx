import { ActivityIndicator, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, ZoomInView } from '../../../components/animations';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';
import { useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../utils/hardware';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Passpad } from '../../views';
import { ShardSender } from '../../../viewmodels/tss/ShardSender';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text } = Animated;

export default ({ vm }: { vm: ShardsAggregator }) => {
  const { t } = i18n;

  return (
    <FadeInDownView>
      <ZoomInView style={{ position: 'relative', width: 250, height: 250, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          style={{ width: 250, height: 250, position: 'absolute' }}
          duration={7000}
          source={require('../../../assets/animations/ripple.json')}
          autoPlay
        />

        <Device deviceId={vm.device.device} os={vm.device.rn_os} style={{ width: 48, height: 52 }} />
      </ZoomInView>

      <Button title={t('button-cancel')} />
    </FadeInDownView>
  );
};

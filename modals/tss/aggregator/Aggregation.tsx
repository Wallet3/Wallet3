import { ActivityIndicator, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, FadeInRightView, ZoomInView } from '../../../components/animations';
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

interface Props {
  vm: ShardsAggregator;
  buttonTitle: string;
  onButtonPress?: () => void;
}

export default observer(({ vm, buttonTitle, onButtonPress }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor } = Theme;
  const { aggregated, threshold } = vm;

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
        <ZoomInView
          delay={300}
          style={{ width: 250, height: 250, position: 'relative', justifyContent: 'center', alignItems: 'center' }}
        >
          <LottieView
            style={{ width: 250, height: 250, position: 'absolute' }}
            duration={7000}
            source={require('../../../assets/animations/ripple.json')}
            autoPlay
          />

          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Device deviceId={vm.device.device} os={vm.device.rn_os} style={{ width: 64, height: 64 }} />
            {/* <Text numberOfLines={1} style={{ fontSize: 12, marginTop: 8, marginBottom: -24, color: secondaryTextColor }}>
              {vm.device.name}
            </Text> */}
          </View>
        </ZoomInView>

        {vm.aggregated === 0 ? (
          <FadeInDownView delay={500}>
            <Text style={{ color: secondaryTextColor, marginHorizontal: 36, fontSize: 12, textAlign: 'center' }}>
              {t('multi-sig-modal-msg-open-wallet3')}
            </Text>
          </FadeInDownView>
        ) : (
          <FadeInRightView delay={500}>
            <Text
              style={{ color: secondaryTextColor, marginHorizontal: 36, fontSize: 15, textAlign: 'center', fontWeight: '500' }}
            >
              {`${t('multi-sig-modal-txt-aggregation-received')}: ${aggregated}/${threshold}`}
            </Text>
          </FadeInRightView>
        )}
      </View>

      <Button title={buttonTitle} onPress={onButtonPress} />
    </FadeInDownView>
  );
});

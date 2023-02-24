import { FadeInDownView, FadeInRightView, FadeInUpView } from '../../../components/animations';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Animated from 'react-native-reanimated';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DeviceRipple from '../components/DeviceRipple';
import { Ionicons } from '@expo/vector-icons';
import { ReactiveScreen } from '../../../utils/device';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import SquircleViewContainer from '../../../components/SquircleViewContainer';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../../constants/styles';
import { startLayoutAnimation } from '../../../utils/animations';

const { View, Text } = Animated;

interface Props {
  vm: ShardsAggregator;
  close: () => void;
}

export default observer(({ vm, close }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor, textColor, tintColor, thirdTextColor, backgroundColor } = Theme;
  const { device, received, aggregated, threshold } = vm;
  const { width } = ReactiveScreen;

  useEffect(() => startLayoutAnimation(), [width]);

  return (
    <FadeInUpView style={{ width: Math.min(width - 24, 520), flex: 1, alignSelf: 'center' }} delay={300}>
      <SquircleViewContainer
        cornerRadius={22}
        style={{ height: 72, flex: 1, backgroundColor, flexDirection: 'row', alignItems: 'center', position: 'relative' }}
      >
        <DeviceRipple
          deviceId={device.device}
          os={device.rn_os}
          containerStyle={{ position: 'absolute', marginStart: -90 }}
          rippleStyle={{ width: 150, height: 150 }}
          deviceStyle={{ width: 36, height: 45 }}
        />

        <View style={{ flex: 1, marginStart: 64, flexDirection: 'column' }}>
          {received === 0 ? (
            <FadeInDownView delay={500}>
              <Text numberOfLines={1} style={{ color: secureColor, ...styles.txt }}>
                {t('multi-sig-modal-msg-open-wallet3')}
              </Text>
            </FadeInDownView>
          ) : aggregated ? (
            <FadeInRightView delay={300}>
              <Text style={{ color: secureColor, ...styles.txt }}>{t('multi-sig-modal-txt-aggregation-done')}</Text>
            </FadeInRightView>
          ) : (
            <FadeInRightView delay={300}>
              <Text style={{ color: secondaryTextColor, ...styles.txt }}>
                {`${t('multi-sig-modal-txt-aggregation-received')}: ${Math.max(0, received - 1)}/${threshold - 1}`}
              </Text>
            </FadeInRightView>
          )}

          <FadeInDownView delay={700} style={{ marginTop: 8 }}>
            <BouncyCheckbox
              size={14}
              onPress={(checked) => vm.setSecretsCached(checked)}
              text={t('multi-sig-modal-msg-aggregated-remember-key')}
              textStyle={{ textDecorationLine: 'none', color: thirdTextColor, fontSize: 14 }}
              iconStyle={{ borderRadius: 3 }}
              textContainerStyle={{ marginStart: 8 }}
              innerIconStyle={{ marginHorizontal: 0, paddingHorizontal: 0, borderRadius: 3 }}
              style={{}}
              fillColor={thirdTextColor}
            />
          </FadeInDownView>
        </View>

        <TouchableOpacity style={{ padding: 12 }} onPress={close}>
          <Ionicons name="close" size={17} color={secondaryTextColor} />
        </TouchableOpacity>
      </SquircleViewContainer>
    </FadeInUpView>
  );
});

const styles = StyleSheet.create({
  txt: {
    fontSize: 15,
    fontWeight: '500',
  },
});

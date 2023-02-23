import { FadeInDownView, FadeInRightView, ZoomInView } from '../../../components/animations';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Animated from 'react-native-reanimated';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceRipple from '../components/DeviceRipple';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../../constants/styles';
import { startLayoutAnimation } from '../../../utils/animations';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text } = Animated;

interface Props {
  vm: ShardsAggregator;
  buttonTitle: string;
  buttonColor?: string;
  hideButton?: boolean;
  buttonDisabled?: boolean;
  enableCacheOption?: boolean;
  onButtonPress?: () => void;
}

export default observer(
  ({ vm, buttonTitle, onButtonPress, buttonDisabled, enableCacheOption, hideButton, buttonColor }: Props) => {
    const { t } = i18n;
    const { secondaryTextColor, tintColor, thirdTextColor, appColor } = Theme;
    const { received, aggregated, threshold } = vm;
    const marginHorizontal = useHorizontalPadding() + 2;

    useEffect(() => {
      received === 1 && startLayoutAnimation();
    }, [received]);

    return (
      <FadeInDownView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: enableCacheOption ? 32 : 24 }}>
          <DeviceRipple deviceId={vm.device.device} os={vm.device.rn_os} />

          {vm.received === 0 ? (
            <FadeInDownView delay={500}>
              <Text style={{ color: secondaryTextColor, ...styles.txt, marginHorizontal }}>
                {t('multi-sig-modal-msg-open-wallet3')}
              </Text>
            </FadeInDownView>
          ) : vm.aggregated ? (
            <FadeInDownView delay={500}>
              <Text style={{ color: secureColor, ...styles.txt }}>{t('multi-sig-modal-txt-aggregation-done')}</Text>
            </FadeInDownView>
          ) : (
            <FadeInRightView delay={500}>
              <Text style={{ color: secondaryTextColor, ...styles.txt }}>
                {`${t('multi-sig-modal-txt-aggregation-received')}: ${Math.max(0, received - 1)}/${threshold - 1}`}
              </Text>
            </FadeInRightView>
          )}
        </View>

        {enableCacheOption && (
          <FadeInDownView delay={700}>
            <BouncyCheckbox
              size={15}
              onPress={(checked) => vm.setSecretsCached(checked)}
              text={t('multi-sig-modal-msg-aggregated-remember-key')}
              textStyle={{ textDecorationLine: 'none', color: secondaryTextColor, fontSize: 14 }}
              iconStyle={{ borderRadius: 3 }}
              textContainerStyle={{ marginStart: 8 }}
              innerIconStyle={{ marginHorizontal: 0, paddingHorizontal: 0, borderRadius: 3 }}
              style={{ marginHorizontal, paddingVertical: 16 }}
              fillColor={appColor}
            />
          </FadeInDownView>
        )}

        {!hideButton && (
          <FadeInDownView delay={900}>
            <Button title={buttonTitle} onPress={onButtonPress} disabled={buttonDisabled} themeColor={buttonColor} />
          </FadeInDownView>
        )}
      </FadeInDownView>
    );
  }
);

const styles = StyleSheet.create({
  txt: {
    marginTop: -12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

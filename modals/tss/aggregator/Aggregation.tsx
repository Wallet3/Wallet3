import { FadeInDownView, FadeInRightView } from '../../../components/animations';
import React, { useEffect } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';

import Animated from 'react-native-reanimated';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import DeviceRipple from '../components/DeviceRipple';
import { StyleSheet } from 'react-native';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../../utils/animations';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text } = Animated;

interface Props {
  vm: {
    device: ClientInfo;
    received: number;
    threshold: number;
    aggregated: boolean;
    lastError: any;
  };

  buttonTitle: string;
  buttonColor?: string;
  hideButton?: boolean;
  buttonDisabled?: boolean;
  enableCacheOption?: boolean;
  onButtonPress?: () => void;
  onSecretCacheSelected?: (selected: boolean) => void;
}

export default observer(
  ({
    vm,
    buttonTitle,
    onButtonPress,
    enableCacheOption,
    hideButton,
    buttonColor,
    buttonDisabled,
    onSecretCacheSelected,
  }: Props) => {
    const { t } = i18n;
    const { secondaryTextColor, appColor } = Theme;

    const marginHorizontal = useHorizontalPadding() + 2;
    const { device, received, threshold, aggregated, lastError } = vm;

    useEffect(() => {
      received === 1 && startLayoutAnimation();
    }, [received]);

    return (
      <FadeInDownView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: enableCacheOption ? 32 : 24 }}>
          <DeviceRipple deviceId={device.device} os={device.rn_os} />

          {received <= 1 ? (
            <FadeInDownView delay={500}>
              <Text style={{ color: secondaryTextColor, ...styles.txt, marginHorizontal }}>
                {t('multi-sig-modal-msg-authorize-on-trusted-devices')}
              </Text>
            </FadeInDownView>
          ) : aggregated ? (
            <FadeInDownView delay={500}>
              <Text style={{ color: secureColor, ...styles.txt }}>{t('multi-sig-modal-txt-aggregation-done')}</Text>
            </FadeInDownView>
          ) : (
            <FadeInRightView delay={500}>
              {lastError ? (
                <Text style={{ color: warningColor, ...styles.txt }}>{`${t('multi-sig-modal-txt-aggregation-error')}`}</Text>
              ) : (
                <Text style={{ color: secondaryTextColor, ...styles.txt }}>
                  {`${t('multi-sig-modal-txt-aggregation-received')}: ${Math.max(0, received - 1)}/${Math.max(
                    0,
                    threshold - 1
                  )}`}
                </Text>
              )}
            </FadeInRightView>
          )}
        </View>

        {enableCacheOption && (
          <FadeInDownView delay={700}>
            <BouncyCheckbox
              size={15}
              onPress={onSecretCacheSelected}
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
    marginTop: -8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginHorizontal: 24,
  },
});

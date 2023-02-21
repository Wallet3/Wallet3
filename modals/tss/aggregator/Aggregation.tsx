import { FadeInDownView, FadeInRightView, ZoomInView } from '../../../components/animations';
import React, { useEffect } from 'react';

import Animated from 'react-native-reanimated';
import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceRipple from '../components/DeviceRipple';
import LottieView from 'lottie-react-native';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import { StyleSheet } from 'react-native';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../../constants/styles';
import { startLayoutAnimation } from '../../../utils/animations';

const { View, Text } = Animated;

interface Props {
  vm: ShardsAggregator;
  buttonTitle: string;
  buttonDisabled?: boolean;
  onButtonPress?: () => void;
}

export default observer(({ vm, buttonTitle, onButtonPress, buttonDisabled }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor } = Theme;
  const { received, aggregated, threshold } = vm;

  useEffect(() => {
    received === 1 && startLayoutAnimation();
  }, [received]);

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
        <DeviceRipple deviceId={vm.device.device} os={vm.device.rn_os} />

        {vm.received === 0 ? (
          <FadeInDownView delay={500}>
            <Text style={{ color: secondaryTextColor, ...styles.txt }}>{t('multi-sig-modal-msg-open-wallet3')}</Text>
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

      <Button title={buttonTitle} onPress={onButtonPress} disabled={buttonDisabled} />
    </FadeInDownView>
  );
});

const styles = StyleSheet.create({
  txt: {
    marginHorizontal: 36,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

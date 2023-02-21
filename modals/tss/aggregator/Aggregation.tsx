import { FadeInDownView, FadeInRightView, ZoomInView } from '../../../components/animations';

import Animated from 'react-native-reanimated';
import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceRipple from '../components/DeviceRipple';
import LottieView from 'lottie-react-native';
import React from 'react';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

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
        <DeviceRipple deviceId={vm.device.device} os={vm.device.rn_os} />

        {vm.aggregated === 0 ? (
          <FadeInDownView delay={500}>
            <Text style={{ color: secondaryTextColor, marginHorizontal: 36, fontSize: 12, textAlign: 'center' }}>
              {t('multi-sig-modal-msg-open-wallet3')}
            </Text>
          </FadeInDownView>
        ) : (
          <FadeInRightView delay={500}>
            <Text
              style={{ color: secondaryTextColor, marginHorizontal: 36, fontSize: 12, textAlign: 'center', fontWeight: '500' }}
            >
              {`${t('multi-sig-modal-txt-aggregation-received')}: ${Math.max(0, aggregated - 1)}/${threshold - 1}`}
            </Text>
          </FadeInRightView>
        )}
      </View>

      <Button title={buttonTitle} onPress={onButtonPress} />
    </FadeInDownView>
  );
});

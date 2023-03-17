import { FadeInDownView, FadeInUpView } from '../../components/animations';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Animated from 'react-native-reanimated';
import { ReactiveScreen } from '../../utils/device';
import SquircleViewContainer from '../../components/SquircleViewContainer';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../constants/styles';
import { startLayoutAnimation } from '../../utils/animations';

const { View, Text } = Animated;

interface Props {
  close: () => void;
}

export default observer(({ close }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor, textColor, tintColor, thirdTextColor, backgroundColor } = Theme;

  const { width } = ReactiveScreen;

  useEffect(() => startLayoutAnimation(), [width]);

  return (
    <FadeInUpView style={{ width: Math.min(width - 24, 520), alignSelf: 'center' }} delay={300}>
      <SquircleViewContainer
        cornerRadius={22}
        style={{ height: 72, flex: 1, backgroundColor, flexDirection: 'row', alignItems: 'center', position: 'relative' }}
      >
        <View style={{ flex: 1, marginStart: 64, flexDirection: 'column' }}>
          <FadeInDownView delay={500}>
            <Text numberOfLines={1} style={{ color: secureColor, ...styles.txt }}>
              {t('multi-sig-modal-msg-authorize-on-trusted-devices')}
            </Text>
          </FadeInDownView>

          <FadeInDownView delay={700} style={{ marginTop: 8 }}>
            {}
          </FadeInDownView>
        </View>
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

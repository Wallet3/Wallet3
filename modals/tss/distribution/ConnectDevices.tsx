import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { secureColor, thirdFontColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import { Ionicons } from '@expo/vector-icons';
import { KeyDistribution } from '../../../viewmodels/tss/KeyDistribution';
import { KeyReceiver } from '../../../viewmodels/tss/KeyReceiver';
import { ReactiveScreen } from '../../../utils/device';
import Swiper from 'react-native-swiper';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/ios';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text } = Animated;

export default observer(({ vm }: { vm: KeyDistribution }) => {
  const { t } = i18n;
  const { textColor, secondaryTextColor, appColor, borderColor } = Theme;
  const { pendingClients, pendingCount, approvedCount } = vm;
  const [marginHorizontal] = useState((getScreenCornerRadius() - 20) / 4 + 16);

  useEffect(() => {
    vm.start();
  }, []);

  const renderItem = ({ item }: { item: TCPClient }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: marginHorizontal,
          paddingVertical: 8,
          position: 'relative',
        }}
      >
        <Device deviceId={item.remoteInfo!.device} os={item.remoteInfo!.rn_os} style={{ width: 32, height: 42 }} />
        <View style={{ marginStart: 16, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: textColor, fontSize: 22, fontWeight: '600', marginBottom: 2 }}>
              {`${item.remoteInfo?.name}`}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ marginEnd: 8, color: secondaryTextColor, opacity: 0.9 }}>Pairing</Text>
              <ActivityIndicator size="small" />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: borderColor,
            }}
          >
            <Text style={{ color: secondaryTextColor }}>{`${item.remoteInfo?.os} ${item.remoteInfo?.osVersion}`}</Text>
            <Text style={{ color: textColor, fontWeight: '600' }}>Pairing Code: {item.verificationCode}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }} entering={FadeInRight.delay(500).springify()} exiting={FadeOutLeft.springify()}>
      {pendingCount || approvedCount ? (
        <FlatList style={{ flex: 1 }} data={pendingClients} renderItem={renderItem} />
      ) : (
        <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }} exiting={FadeOutUp.springify()}>
          <ActivityIndicator />
          <Text style={{ alignSelf: 'center', marginTop: 52, lineHeight: 27, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-tip')}
          </Text>
        </View>
      )}

      <Button title={t('button-next')} disabled={vm.approvedCount === 0} />
    </View>
  );
});

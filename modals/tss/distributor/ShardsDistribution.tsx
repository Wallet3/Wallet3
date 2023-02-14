import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import { Passpad } from '../../views';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Slider from '@react-native-community/slider';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { calcHorizontalPadding } from '../components/Utils';
import deviceInfoModule from 'react-native-device-info';
import { getDeviceInfo } from '../../../common/p2p/Utils';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View } = Animated;

export default observer(({ vm }: { vm: ShardsDistributor }) => {
  const { t } = i18n;
  const [marginHorizontal] = useState(calcHorizontalPadding());
  const { approvedClients, approvedCount } = vm;
  const { secondaryTextColor } = Theme;

  const [selfInfo] = useState({
    ...getDeviceInfo(),
    name: `${deviceInfoModule.getDeviceNameSync()} (${t('multi-sign-txt-current-device')})`,
    ip: '::1',
  });

  const renderConnectedItem = ({ info, index }: { info: ClientInfo & { ip: string }; index: number }) => {
    return (
      <View
        entering={FadeInDown.delay(50 * index).springify()}
        exiting={FadeOutUp.springify()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: marginHorizontal,
          paddingVertical: 8,
          position: 'relative',
        }}
      >
        <DeviceInfo info={info} />
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, position: 'relative' }}
      entering={FadeInRight.delay(500).springify()}
      exiting={FadeOutLeft.springify()}
    >
      <View style={{ flex: 1, marginBottom: 20 }}>
        <Text style={{ marginHorizontal, fontWeight: '500', color: secondaryTextColor }}>
          {t('multi-sign-keys-distribution')}
        </Text>

        <FlatList
          bounces={approvedCount >= 5}
          keyExtractor={(i) => i.ip}
          renderItem={(i) => renderConnectedItem({ info: i.item, index: i.index + 1 })}
          contentContainerStyle={{ paddingVertical: 4 }}
          data={[selfInfo].concat(
            approvedClients.map((i) => {
              return { ...i.remoteInfo!, ip: i.remoteIP };
            })
          )}
        />
      </View>

      <Button disabled={approvedCount === 0} title={t('button-shards-distribute')} />
    </View>
  );
});

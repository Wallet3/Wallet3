import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { Ionicons, Octicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ShardSender, ShardTransferringStatus } from '../../../viewmodels/tss/ShardSender';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import { Passpad } from '../../views';
import Slider from '@react-native-community/slider';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { ZoomInView } from '../../../components/animations';
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
    remoteIP: '::1',
  });

  const renderConnectedItem = ({ item, index }: { item: ShardSender | ClientInfo; index: number }) => {
    const info: ClientInfo = item['remoteInfo'] ?? item;
    const status = item['status'] ?? vm.localShardStatus;

    return (
      <View
        entering={FadeInDown.delay(50 * index).springify()}
        exiting={FadeOutUp.springify()}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: marginHorizontal, paddingVertical: 8 }}
      >
        <DeviceInfo info={info} />

        <View style={{ marginStart: 24 }}>
          {status === ShardTransferringStatus.sending && <ActivityIndicator size="small" />}
          {status === ShardTransferringStatus.ackFailed && <Ionicons name="warning" color={warningColor} size={20} />}
          {status === ShardTransferringStatus.ackSucceed && (
            <ZoomInView>
              <Ionicons name="checkmark-circle" color={secureColor} size={24} />
            </ZoomInView>
          )}
        </View>
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
          keyExtractor={(i) => i.remoteIP}
          contentContainerStyle={{ paddingVertical: 4 }}
          data={[selfInfo, ...approvedClients]}
          renderItem={renderConnectedItem}
        />
      </View>

      {vm.status === ShardsDistributionStatus.distributionSucceed ? (
        <Button title={t('button-done')} themeColor={secureColor} />
      ) : (
        <Button
          disabled={approvedCount < 1 || vm.status === ShardsDistributionStatus.distributing}
          title={t('button-shards-distribute')}
          onPress={() => vm.distributeSecret()}
        />
      )}
    </View>
  );
});

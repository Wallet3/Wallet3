import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
} from 'react-native-reanimated';
import { FadeInDownView, ZoomInView } from '../../../components/animations';
import { Ionicons, Octicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ShardSender, ShardTransferringStatus } from '../../../viewmodels/tss/ShardSender';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import IllustrationCompleted from '../../../assets/illustrations/tss/completed.svg';
import { Passpad } from '../../views';
import Slider from '@react-native-community/slider';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import { getDeviceInfo } from '../../../common/p2p/Utils';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../components/Utils';

const { View } = Animated;

interface Props {
  vm: ShardsDistributor;
  close: () => void;
  onCritical: (flag: boolean) => void;
}

const DeviceStatus = observer(({ item, vm }: { item: ShardSender | ClientInfo; vm: ShardsDistributor }) => {
  const status = (item as ShardSender).status ?? vm.localShardStatus;

  return (
    <View style={{ marginStart: 24 }}>
      {status === ShardTransferringStatus.sending && <ActivityIndicator size="small" />}

      {status === ShardTransferringStatus.ackFailed && (
        <ZoomInView>
          <Ionicons name="warning" color={warningColor} size={20} />
        </ZoomInView>
      )}

      {status === ShardTransferringStatus.ackSucceed && (
        <ZoomInView>
          <Ionicons name="checkmark-circle" color={secureColor} size={24} />
        </ZoomInView>
      )}
    </View>
  );
});

export default observer(({ vm, close, onCritical }: Props) => {
  const { t } = i18n;
  const marginHorizontal = useHorizontalPadding();
  const { approvedClients, approvedCount, thresholdTooHigh } = vm;
  const { secondaryTextColor, backgroundColor } = Theme;

  const [selfInfo] = useState({
    ...getDeviceInfo(),
    name: `${deviceInfoModule.getDeviceNameSync()} (${t('multi-sig-modal-txt-current-device')})`,
    remoteIP: '::1',
  });

  const renderConnectedItem = ({ item, index }: { item: ShardSender | ClientInfo; index: number }) => {
    const info: ClientInfo = item['remoteInfo'] ?? item;

    return (
      <View
        entering={FadeInDown.delay(50 * index).springify()}
        exiting={FadeOutUp.springify()}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: marginHorizontal, paddingVertical: 8 }}
      >
        <DeviceInfo info={info} />
        <DeviceStatus item={item} vm={vm} />
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, position: 'relative' }}
      entering={FadeInRight.delay(300).springify()}
      exiting={FadeOutRight.springify()}
    >
      {vm.status === ShardsDistributionStatus.succeed ? (
        <FadeInDownView style={{ backgroundColor, flex: 1, justifyContent: 'center', alignItems: 'center' }} delay={500}>
          <IllustrationCompleted width={150} height={150} />
        </FadeInDownView>
      ) : (
        <View style={{ flex: 1, marginBottom: 16 }}>
          <Text style={{ marginHorizontal, fontWeight: '500', color: secondaryTextColor }}>
            {t('multi-sig-modal-connect-approved-clients')}:
          </Text>

          <FlatList
            bounces={approvedCount >= 4}
            keyExtractor={(i) => i.remoteIP}
            contentContainerStyle={{ paddingVertical: 4 }}
            data={[selfInfo, ...approvedClients]}
            renderItem={renderConnectedItem}
          />

          {thresholdTooHigh && (
            <Text style={{ color: warningColor, fontSize: 12.5, fontWeight: '500', marginHorizontal }}>
              <Ionicons name="warning" size={14} />
              {`  ${t('multi-sig-modal-msg-threshold-too-high')}`}
            </Text>
          )}
        </View>
      )}

      {vm.status > ShardsDistributionStatus.distributing ? (
        <Button
          title={t(vm.status === ShardsDistributionStatus.succeed ? 'button-done' : 'button-close')}
          themeColor={vm.status === ShardsDistributionStatus.succeed ? secureColor : warningColor}
          onPress={close}
        />
      ) : (
        <Button
          disabled={approvedCount < 1 || vm.status === ShardsDistributionStatus.distributing}
          title={t('button-shards-distribute')}
          onPress={async () => {
            onCritical(true);
            await vm.distributeSecret();
            onCritical(false);
          }}
        />
      )}
    </View>
  );
});
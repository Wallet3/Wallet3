import { ActivityIndicator, FlatList, Text } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutRight, FadeOutUp } from 'react-native-reanimated';
import { FadeInDownView, ZoomInView } from '../../../components/animations';
import React, { useState } from 'react';
import { ShardSender, ShardTransferringStatus } from '../../../viewmodels/tss/ShardSender';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { getDeviceBasicInfo, getDeviceInfo } from '../../../common/p2p/Utils';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import DeviceInfo from '../components/DeviceInfo';
import IllustrationCompleted from '../../../assets/illustrations/tss/completed.svg';
import IllustrationDenied from '../../../assets/illustrations/misc/access_denied.svg';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../components/Utils';

const { View } = Animated;

interface Props {
  vm: ShardsDistributor;
  close: () => void;
  onCritical: (flag: boolean) => void;
  includeSelf?: boolean;
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

export default observer(({ vm, close, onCritical, includeSelf }: Props) => {
  const { t } = i18n;
  const marginHorizontal = useHorizontalPadding();
  const { approvedClients, approvedCount, thresholdTooHigh } = vm;
  const { secondaryTextColor, backgroundColor } = Theme;

  const [selfInfo] = useState(
    includeSelf
      ? {
          ...getDeviceBasicInfo(),
          remoteIP: '::1',
          name: `${deviceInfoModule.getDeviceNameSync()} (${t('multi-sig-modal-txt-current-device')})`,
        }
      : undefined
  );

  const doCritical = async () => {
    onCritical(true);
    await vm.distributeSecret();
    onCritical(false);
  };

  const renderConnectedItem = ({
    item,
    index,
  }: {
    item: ShardSender | (ClientInfo & { remoteIP: string });
    index: number;
  }) => {
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
      {vm.status === ShardsDistributionStatus.succeed && (
        <FadeInDownView style={{ backgroundColor, flex: 1, justifyContent: 'center', alignItems: 'center' }} delay={500}>
          <IllustrationCompleted width={150} height={150} />
          <Text style={{ color: secureColor, marginTop: 24, fontWeight: '600', textTransform: 'capitalize' }}>
            {t('multi-sig-modal-txt-data-distribution-completed')}
          </Text>
        </FadeInDownView>
      )}

      {vm.status === ShardsDistributionStatus.failed && (
        <FadeInDownView style={{ backgroundColor, flex: 1, justifyContent: 'center', alignItems: 'center' }} delay={500}>
          <IllustrationDenied width={150} height={150} />
          <Text style={{ color: secondaryTextColor, marginTop: 24, fontWeight: '500', textTransform: 'capitalize' }}>
            {t('multi-sig-modal-txt-data-distribution-failed')}
          </Text>
        </FadeInDownView>
      )}

      {vm.status <= ShardsDistributionStatus.distributing && (
        <View style={{ flex: 1, marginBottom: 16 }}>
          <Text style={{ marginHorizontal, fontWeight: '500', color: secondaryTextColor }}>
            {t('multi-sig-modal-connect-approved-clients')}:
          </Text>

          <FlatList
            bounces={approvedCount >= 4}
            keyExtractor={(i) => i.remoteIP}
            contentContainerStyle={{ paddingVertical: 4 }}
            data={includeSelf ? [selfInfo as any, ...approvedClients] : approvedClients}
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
          disabled={!vm.clientsOK || vm.status === ShardsDistributionStatus.distributing}
          title={t('button-shards-distribute')}
          onPress={doCritical}
        />
      )}
    </View>
  );
});

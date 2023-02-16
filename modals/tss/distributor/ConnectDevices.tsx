import { ActivityIndicator, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
} from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import DeviceInfo from '../components/DeviceInfo';
import { Ionicons } from '@expo/vector-icons';
import { ModalMarginScreen } from '../../styles';
import { Passpad } from '../../views';
import { ShardSender } from '../../../viewmodels/tss/ShardSender';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import { calcHorizontalPadding } from '../components/Utils';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { View, Text } = Animated;

export default observer(({ vm, onNext, isRTL }: { isRTL?: boolean; vm: ShardsDistributor; onNext: () => void }) => {
  const { t } = i18n;
  const { textColor, secondaryTextColor, backgroundColor, borderColor } = Theme;
  const { pendingClients, approvedClients, pendingCount, approvedCount } = vm;
  const [marginHorizontal] = useState(calcHorizontalPadding());
  const [verifying, setVerifying] = useState<{ client: ShardSender; attempts: number }>();
  const { bottom: safeBottom } = useSafeAreaInsets();

  useEffect(() => {
    vm.start();
  }, []);

  const verifyClient = async (code: string) => {
    if (!verifying) return false;

    const verified = code === verifying.client.pairingCode;
    const maxFailedAttempts = 3;

    verified && vm.approveClient(verifying.client, code);

    verifying.attempts >= maxFailedAttempts
      ? setTimeout(() => setVerifying(undefined), 500) && vm.rejectClient(verifying.client)
      : setVerifying(verified ? undefined : { client: verifying.client, attempts: verifying.attempts + 1 });

    return verified;
  };

  const renderConnectedItem = ({ item }: { item: ShardSender }) => {
    return (
      <View
        entering={FadeInDown.delay(50).springify()}
        exiting={FadeOutUp.springify()}
        style={{ ...styles.listItem, paddingHorizontal: marginHorizontal }}
      >
        <DeviceInfo info={item.remoteInfo!} verified />
        <View style={{ marginStart: 16 }} />
      </View>
    );
  };

  const renderPendingItem = ({ item }: { item: ShardSender }) => {
    return (
      <View
        entering={FadeInDown.delay(50).springify()}
        exiting={FadeOutUp.springify()}
        style={{ ...styles.listItem, paddingHorizontal: marginHorizontal }}
      >
        <DeviceInfo info={item.remoteInfo!} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: -8, marginStart: 36 }}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => vm.rejectClient(item)}>
            <Ionicons name="close-circle-outline" size={32} color={warningColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={() => setVerifying({ client: item, attempts: 0 })}>
            <Ionicons name="checkmark-circle-outline" size={32} color={secureColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ShardSender }) => {
    return approvedClients.includes(item) ? renderConnectedItem({ item }) : renderPendingItem({ item });
  };

  return (
    <View
      style={{ flex: 1, position: 'relative' }}
      entering={isRTL ? FadeInLeft.delay(300).springify() : FadeInRight.delay(300).springify()}
      exiting={FadeOutLeft.springify()}
    >
      {pendingCount || approvedCount ? (
        <SectionList
          keyExtractor={(c) => c.remoteIP}
          bounces={approvedCount + pendingCount >= 5}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={renderItem}
          sections={
            [
              approvedCount > 0 ? { title: t('multi-sign-connect-approved-clients'), data: approvedClients } : undefined,
              pendingCount > 0 ? { title: t('multi-sign-connect-pending-clients'), data: pendingClients } : undefined,
            ].filter((i) => i !== undefined) as { title: string; data: ShardSender[] }[]
          }
          renderSectionHeader={({ section }) => (
            <Text
              style={{
                ...styles.listTitle,
                color: secondaryTextColor,
                marginHorizontal,
                textShadowColor: '#fff',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3,
              }}
            >
              {section.title}
            </Text>
          )}
        />
      ) : (
        <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }} exiting={FadeOutUp.springify()}>
          <ActivityIndicator />
          <Text style={{ alignSelf: 'center', marginTop: 52, lineHeight: 27, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-tip')}
          </Text>
        </View>
      )}

      <Button title={t('button-next')} disabled={approvedCount === 0} onPress={onNext} />

      {verifying && (
        <View
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.springify()}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor,
            alignItems: 'center',
            paddingBottom: safeBottom - 16 - ModalMarginScreen,
          }}
        >
          <Text style={{ marginTop: 12, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-enter-pairing-code')}:
          </Text>

          <Passpad
            disableCancelButton
            passLength={4}
            failedAttempts={verifying.attempts}
            style={{ paddingBottom: 12, paddingTop: 0 }}
            onCodeEntered={verifyClient}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  listTitle: {
    fontWeight: '500',
    opacity: 0.75,
    textTransform: 'capitalize',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  confirmButton: {
    padding: 4,
    paddingHorizontal: 8,
  },
});

import { ActivityIndicator, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { secureColor, verifiedColor, warningColor } from '../../../constants/styles';
import { useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../utils/hardware';

import Button from '../components/Button';
import DeviceInfo from '../components/DeviceInfo';
import { Ionicons } from '@expo/vector-icons';
import { Passpad } from '../../views';
import { ShardSender } from '../../../viewmodels/tss/ShardSender';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import TinyInfo from '../../components/TinyInfo';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text } = Animated;

export default observer(({ vm, onNext, isRTL }: { isRTL?: boolean; vm: ShardsDistributor; onNext: () => void }) => {
  const marginHorizontal = useHorizontalPadding();
  const safeBottom = useOptimizedSafeBottom();
  const cornerRadius = useOptimizedCornerRadius();
  const [verifying, setVerifying] = useState<{ client: ShardSender; attempts: number }>();

  const { t } = i18n;
  const { secondaryTextColor, backgroundColor } = Theme;
  const { pendingClients, approvedClients, pendingCount, approvedCount, distributable, threshold } = vm;

  const verifyClient = async (code: string) => {
    if (!verifying) return false;

    const verified = code === verifying.client.pairingCode;
    const maxFailedAttempts = 3;

    if (verified) {
      if (!vm.approveClient(verifying.client, code)) {
        showMessage({ message: t('multi-sig-modal-msg-device-exists'), type: 'warning' });
        vm.rejectClient(verifying.client);
      }

      setVerifying(undefined);
    } else {
      if (verifying.attempts >= maxFailedAttempts) {
        setTimeout(() => setVerifying(undefined), 0);
        vm.rejectClient(verifying.client);
      }

      setVerifying({ client: verifying.client, attempts: verifying.attempts + 1 });
    }

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: -8, marginStart: 24 }}>
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
              approvedCount > 0 ? { title: t('multi-sig-modal-connect-approved-clients'), data: approvedClients } : undefined,
              pendingCount > 0 ? { title: t('multi-sig-modal-connect-pending-clients'), data: pendingClients } : undefined,
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
          <ActivityIndicator color={verifiedColor} />
          <Text
            style={{
              alignSelf: 'center',
              marginTop: 52,
              lineHeight: 27,
              color: secondaryTextColor,
              fontWeight: '500',
              marginHorizontal: 24,
            }}
          >
            {t('multi-sig-modal-connect-tip')}
          </Text>
        </View>
      )}

      {approvedCount >= 1 && !distributable && (
        <TinyInfo
          style={{ flexDirection: 'row', marginHorizontal, marginBottom: 8 }}
          color={secondaryTextColor}
          icon="information-circle"
          message={t('multi-sig-modal-txt-aggregation-at-least', { n: threshold - 1 })}
        />
      )}

      <Button title={t('button-next')} disabled={!distributable} onPress={onNext} />

      {verifying && (
        <View
          entering={FadeInDown.delay(0)}
          exiting={FadeOutDown.springify()}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor,
            alignItems: 'center',
            flex: 1,
            paddingBottom: safeBottom,
            borderBottomLeftRadius: cornerRadius + 20,
            borderBottomRightRadius: cornerRadius + 20,
          }}
        >
          <Text style={{ marginTop: 12, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sig-modal-connect-enter-pairing-code')}:
          </Text>

          <Passpad
            disableCancelButton
            passLength={4}
            failedAttempts={verifying.attempts}
            style={{ padding: 0, paddingHorizontal: 16 }}
            numPadStyle={{ borderRadius: Math.max(cornerRadius, 12) }}
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
